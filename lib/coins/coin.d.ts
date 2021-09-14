import { Observable } from 'rxjs';
import { UserAccount, Output } from 'libzeropool-rs-wasm-bundler';
import { Transaction, TxFee } from './transaction';
import { CoinType } from './coin-type';
export declare class Balance {
    address: string;
    balance: string;
}
export declare abstract class Coin {
    abstract getPrivateKey(account: number): string;
    abstract getPublicKey(account: number): string;
    abstract getAddress(account: number): string;
    protected mnemonic: string;
    privateAccount: UserAccount;
    private initPromise;
    constructor(mnemonic: string);
    protected init(): Promise<void>;
    ready(): Promise<void>;
    generatePrivateAddress(): string;
    getPrivateSpendingKey(): Uint8Array;
    /**
     * Get native coin balance.
     */
    abstract getBalance(account: number): Promise<string>;
    /**
     * Get balances for specified number of accounts with offset.
     * @param numAccounts
     * @param offset
     */
    getBalances(numAccounts: number, offset?: number): Promise<Balance[]>;
    /**
     * Transfer native coin.
     * @param to destination address
     * @param amount as base unit
     */
    abstract transfer(account: number, to: string, amount: string): Promise<void>;
    transferPublicToPrivate(account: number, outputs: Output[]): Promise<void>;
    transferPrivateToPrivate(account: number, outputs: Output[]): Promise<void>;
    depositPrivate(account: number, amount: string): Promise<void>;
    mergePrivate(): Promise<void>;
    withdrawPrivate(account: number, amount: string): Promise<void>;
    /**
     * Get current total private balance (account + unspent notes).
     */
    getPrivateBalance(): string;
    updatePrivateState(): Promise<void>;
    /**
     * Fetch account transactions.
     */
    abstract getTransactions(account: number, limit?: number, offset?: number): Promise<Transaction[]>;
    /**
     * Subscribe to account events.
     */
    abstract subscribe(account: number): Promise<Observable<Transaction>>;
    /**
     * Convert human-readable representation of coin to smallest non-divisible (base) representation.
     * @param amount
     */
    abstract toBaseUnit(amount: string): string;
    /**
    * Convert coin represented with smallest non-divisible units to a human-readable representation.
    * @param amount
    */
    abstract fromBaseUnit(amount: string): string;
    /**
     * Get estimated transaction fee.
     */
    abstract estimateTxFee(): Promise<TxFee>;
    abstract getCoinType(): CoinType;
    getNotes(): Promise<[string]>;
}
