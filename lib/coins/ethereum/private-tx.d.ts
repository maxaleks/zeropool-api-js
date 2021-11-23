import Web3 from 'web3';
import { TransactionData, Params, SnarkProof, UserAccount, VK } from "../../libzeropool-rs";
export declare enum TxType {
    Deposit = "00",
    Transfer = "01",
    Withdraw = "02"
}
export declare function txTypeToString(txType: TxType): string;
export declare class EthPrivateTransaction {
    selector: string;
    nullifier: bigint;
    outCommit: bigint;
    transferIndex: bigint;
    energyAmount: bigint;
    tokenAmount: bigint;
    transactProof: bigint[];
    rootAfter: bigint;
    treeProof: bigint[];
    txType: TxType;
    memo: string;
    static fromData(txData: TransactionData, txType: TxType, acc: UserAccount, snarkParams: {
        transferParams: Params;
        treeParams: Params;
        transferVk?: VK;
        treeVk?: VK;
    }, web3: Web3, worker: any): Promise<EthPrivateTransaction>;
    get ciphertext(): string;
    /**
     * Returns encoded transaction ready to use as data for the smart contract.
     */
    encode(): string;
    static decode(data: string): EthPrivateTransaction;
}
export declare function flattenSnarkProof(p: SnarkProof): bigint[];
