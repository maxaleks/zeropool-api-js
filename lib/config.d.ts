import { Config as NearConfig } from './coins/near';
import { Config as EthereumConfig } from './coins/ethereum';
import { Config as WavesConfig } from './coins/waves';
import { Params, VK } from './libzeropool-rs';
export interface Config {
    near?: NearConfig;
    ethereum?: EthereumConfig;
    waves?: WavesConfig;
    snarkParams: SnarkConfigParams;
    wasmPath: string;
    workerPath: string;
}
export interface SnarkConfigParams {
    transferParamsUrl: string;
    treeParamsUrl: string;
    transferVkUrl: string;
    treeVkUrl: string;
}
export interface SnarkParams {
    transferParams: Params;
    treeParams: Params;
    transferVk?: VK;
    treeVk?: VK;
}
