import { HDWallet, CoinType } from 'zeropool-api-js';
import { generateMnemonic } from 'zeropool-api-js/lib/utils';
import config from '../config.dev';

async function example() {
  const mnemonic = generateMnemonic();
  const hdWallet = new HDWallet(mnemonic, [CoinType.near], config);

  const near = hdWallet.getCoin(CoinType.near);
  const balance = await near.getBalance();

  console.log('Balance: ', balance);
  await near.transfer('some address', '10000000000000000');
}
