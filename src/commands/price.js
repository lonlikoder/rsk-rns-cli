import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { RSKRegistrar } = pkg;
import { ethers, BigNumber } from 'ethers';
import { getProvider } from '../utils/provider.js';

const priceCommand = new Command('rns:price')
  .description('Get the price for registering a RNS domain')
  .requiredOption('-d, --domain <name>', 'Domain name to check price')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .option('-y, --years <years>', 'Duration in years', '1')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Please set your PRIVATE_KEY in the environment variables.');
      }
      const signer = new ethers.Wallet(privateKey, provider);

      // Addresses
      const rskOwnerAddress = opts.network === 'mainnet' ? '0xd1ee3f08e63b3df20b55d2a30c39b6d8e9b4a861' : '0xca0a477e19bac7e0e172ccfd2e3c28a7200bdb71';
      const fifsAddrRegistrarAddress = opts.network === 'mainnet' ? '0xb6a45c93a5e8d4f8f2b8b9e0c9d9e6f8a9b0c1d2' : '0x90734bd6bf96250a7b262e2bc34284b0d47c1e8d';
      const rifTokenAddress = opts.network === 'mainnet' ? '0x2acc95758f8b5f583470ba265eb685a8f45fc1d5' : '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe';

      const rskRegistrar = new RSKRegistrar(rskOwnerAddress, fifsAddrRegistrarAddress, rifTokenAddress, signer);

      console.log(`Connecting to ${opts.network} network...`);
      console.log(`Calculating price for ${opts.domain} for ${opts.years} years...`);

      const label = opts.domain.replace('.rsk', '');
      const duration = BigNumber.from(opts.years);
      const price = await rskRegistrar.price(label, duration);

      console.log(`Registration price: ${ethers.utils.formatUnits(price, 18)} RIF`);
      console.log(`Domain: ${opts.domain}`);
      console.log(`Duration: ${opts.years} year(s)`);
      console.log(`Network: ${opts.network}`);

    } catch (err) {
      console.error('Get price failed:', err.message);
    }
  });

export default priceCommand;
