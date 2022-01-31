"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = exports.Balance = void 0;
const libzeropool_rs_1 = require("../libzeropool-rs");
;
const network_type_1 = require("./network-type");
const utils_1 = require("../utils");
class Balance {
}
exports.Balance = Balance;
class Network {
    constructor(mnemonic, state, worker) {
        this.mnemonic = mnemonic;
        this.worker = worker;
        this.zpState = state;
    }
    generatePrivateAddress() {
        return this.zpState.account.generateAddress();
    }
    isOwnPrivateAddress(address) {
        return this.zpState.account.isOwnAddress(address);
    }
    getPrivateSpendingKey() {
        const path = network_type_1.NetworkType.privateDerivationPath(this.getNetworkType());
        const pair = (0, utils_1.deriveEd25519)(path, this.mnemonic); // FIXME: Derive on BabyJubJub
        return (0, libzeropool_rs_1.reduceSpendingKey)(pair.secretKey.slice(0, 32));
    }
    getTokenBalance(account, tokenAddress) {
        throw new Error('unimplemented');
    }
    /**
     * Get balances for specified number of accounts with offset.
     * @param numAccounts
     * @param offset
     */
    async getBalances(numAccounts, offset = 0) {
        const promises = [];
        for (let account = offset; account < offset + numAccounts; ++account) {
            const promise = this.getBalance(account)
                .catch(_err => '0') // TODO: Log errors
                .then((balance) => ({
                address: this.getAddress(account),
                balance,
            }));
            promises.push(promise);
        }
        return Promise.all(promises);
    }
    transferToken(account, tokenAddress, to, amount) {
        throw new Error('unimplemented');
    }
    mint(account, tokenAddres, amount) {
        throw new Error('unimplemented');
    }
    transferShielded(tokenAddress, outputs) {
        throw new Error('unimplemented');
    }
    depositShielded(account, tokenAddress, amount) {
        throw new Error('unimplemented');
    }
    withdrawShielded(account, tokenAddress, amount) {
        throw new Error('unimplemented');
    }
    /**
     * Get current total private balance (account + unspent notes).
     */
    getShieldedBalance() {
        throw new Error('unimplemented');
    }
    /**
   * Get total, account, and note balances.
   */
    getShieldedBalances() {
        throw new Error('unimplemented');
    }
    updatePrivateState() {
        throw new Error('unimplemented');
    }
    async getNotes() {
        throw new Error('unimplemented');
    }
    free() { }
}
exports.Network = Network;
//# sourceMappingURL=network.js.map