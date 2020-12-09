import BN from 'bn.js';
import { Account, KeyPair, connect } from 'near-api-js';
import { KeyStore, InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { AccountBalance } from 'near-api-js/lib/account';


import { LocalAccount } from '../local-account';
import { Config, Environment, getConfig } from './config';

export class NearClient {
    private keyStore: KeyStore;
    readonly config: Config;
    public nearAccount: Account;
    public localAccount: LocalAccount;

    constructor(env: Environment) {
        this.keyStore = new InMemoryKeyStore();
        this.config = getConfig(env);
    }

    public isLoggedIn(): boolean {
        return this.localAccount && !this.localAccount.isLocked();
    }

    public async login(localAccount: LocalAccount) {
        localAccount.requireAuth();

        const privateKey = localAccount.getNearPrivateKey();
        const address = localAccount.getNearAddress();

        await this.keyStore.setKey(this.config.networkId, address, KeyPair.fromString(privateKey));

        const options = { ...this.config, deps: { keyStore: this.keyStore } };
        const near = await connect(options);
        this.localAccount = localAccount;
        this.nearAccount = await near.account(address);
    }

    public async transferNear(to: string, amount: string) {
        await this.nearAccount.sendMoney(to, new BN(amount));
    }

    public async getNearBalance(): Promise<AccountBalance> {
        return await this.nearAccount.getAccountBalance();
    }
}
