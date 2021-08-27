import { Config } from './config';
import { ChainId as WavesChainId } from './coins/waves/config';

const config: Config = {
  near: {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://explorer.mainnet.near.org',
  },
  ethereum: {
    httpProviderUrl: 'https://main-rpc.linkpool.io',
    wsProviderUrl: 'wss://main.eth.linkpool.io/ws',
    contractAddress: '',
    contractBlock: 0,
  },
  waves: {
    nodeUrl: 'https://nodes.wavesplatform.com',
    chainId: WavesChainId.Mainnet,
  },
  paramsUrl: 'params.bin',
};

export default config;
