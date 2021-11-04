import { Output, Proof } from "libzeropool-rs-wasm-bundler";
import Web3 from "web3";
import { TransactionConfig } from "web3-eth";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { Config } from "..";
import { SnarkParams } from "../../../config";
import { hexToBuf, toTwosComplementHex } from "../../../utils";
import { ZeroPoolBackend } from "../../../zp/backend";
import { ZeroPoolState } from "../../../zp/state";
import { EthPrivateTransaction, TxType, txTypeToString } from "../private-tx";
import tokenAbi from '../token-abi.json';
import { toCompactSignature } from "../utils";

export interface RelayerInfo {
    root: string;
    deltaIndex: string;
}

export class RelayerAPI {
    url: URL;

    constructor(url: URL) {
        this.url = url;
    }

    async fetchTransactions(offset: BigInt, limit: number = 100): Promise<string[]> {
        const url = new URL('/transactions', this.url);
        url.searchParams.set('offset', offset.toString());
        url.searchParams.set('limit', limit.toString());

        const res = await (await fetch(url.toString())).json();

        return res;
    }

    async sendTransaction(proof: Proof, memo: string, txType: TxType, withdrawSignature?: string): Promise<void> {
        const url = new URL('/transaction', this.url);
        const res = await fetch(url.toString(), { method: 'POST', body: JSON.stringify({ proof, memo, txType, withdrawSignature }) });

        if (res.status !== 204) {
            const body = await res.json();
            throw new Error(`Error ${res.status}: ${JSON.stringify(body)}`)
        }
    }

    async info(): Promise<RelayerInfo> {
        const url = new URL('/info', this.url);
        const res = await fetch(url.toString());

        return await res.json();
    }
}

export class RelayerBackend extends ZeroPoolBackend {
    private relayer: RelayerAPI;
    private tokenContract: Contract;
    private config: Config;
    private web3: Web3;
    private snarkParams: SnarkParams;

    constructor(url: URL, web3: Web3, state: ZeroPoolState, snarkParams: SnarkParams, config: Config) {
        super(state);

        this.web3 = web3;
        this.tokenContract = new this.web3.eth.Contract(tokenAbi as AbiItem[], config.tokenContractAddress) as Contract;
        this.relayer = new RelayerAPI(url);
        this.zpState = state;
        this.snarkParams = snarkParams;
    }

    async transfer(_privateKey: string, outsWei: Output[]): Promise<void> {
        const txType = TxType.Transfer;

        const memo = new Uint8Array(8); // FIXME: fee
        const outGwei = outsWei.map(({ to, amount }) => ({
            to,
            amount: (BigInt(amount) / this.zpState.denominator).toString(),
        }));

        const txData = await this.zpState.privateAccount.createTx(txTypeToString(txType), outGwei, memo);
        const txProof = Proof.tx(this.snarkParams.transferParams, txData.public, txData.secret);

        this.relayer.sendTransaction(txProof, txData.memo, txType);
    }

    async deposit(privateKey: string, amountWei: string): Promise<void> {
        const txType = TxType.Deposit;
        const memo = new Uint8Array(8); // FIXME: fee

        const outGwei = (BigInt(amountWei) / this.zpState.denominator).toString();
        const txData = await this.zpState.privateAccount.createTx(txTypeToString(txType), outGwei, memo);
        const txProof = Proof.tx(this.snarkParams.transferParams, txData.public, txData.secret);

        const nullifier = '0x' + BigInt(txData.public.nullifier).toString(16).padStart(64, '0');
        const sign = await this.web3.eth.accounts.sign(nullifier, privateKey);
        const signature = toCompactSignature(sign.signature).slice(2);

        await this.approveAllowance(privateKey, amountWei);
        this.relayer.sendTransaction(txProof, txData.memo, txType, signature);
    }

    async withdraw(privateKey: string, amountWei: string): Promise<void> {
        const txType = TxType.Withdraw;
        const address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;

        // FIXME: fee
        const memo = new Uint8Array(8 + 8 + 20); // fee + amount + address
        const amountBn = hexToBuf(toTwosComplementHex(BigInt(amountWei) / this.zpState.denominator, 8));
        memo.set(amountBn, 8);
        const addressBin = hexToBuf(address);
        memo.set(addressBin, 16);

        const outGwei = (BigInt(amountWei) / this.zpState.denominator).toString();
        const txData = await this.zpState.privateAccount.createTx(txTypeToString(txType), outGwei, memo);
        const txProof = Proof.tx(this.snarkParams.transferParams, txData.public, txData.secret);

        this.relayer.sendTransaction(txProof, txData.memo, txType);
    }

    private async approveAllowance(privateKey: string, amount: string): Promise<void> {
        const address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
        // await this.tokenContract.methods.approve(this.config.contractAddress, BigInt(amount)).send({ from: address })

        // await this.tokenContract.methods.mint(address, BigInt(amount)).send({ from: address });
        const encodedTx = this.tokenContract.methods.approve(this.config.contractAddress, BigInt(amount)).encodeABI();
        var txObject: TransactionConfig = {
            from: address,
            to: this.config.tokenContractAddress,
            data: encodedTx,
        };

        const gas = await this.web3.eth.estimateGas(txObject);
        const gasPrice = BigInt(await this.web3.eth.getGasPrice());
        const nonce = await this.web3.eth.getTransactionCount(address);
        txObject.gas = gas;
        txObject.gasPrice = `0x${gasPrice.toString(16)}`;
        txObject.nonce = nonce;

        const signedTx = await this.web3.eth.accounts.signTransaction(txObject, privateKey);
        const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

        console.log('approve', result);
    }
}
