import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { RSKRegistrar } = pkg;
import { ethers, BigNumber } from 'ethers';
import { getProvider } from '../utils/provider.js';
import { getNetworkAddress } from '../config/network.js';

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
      const rskOwnerAddress = getNetworkAddress('rskOwner', opts.network);
      const fifsAddrRegistrarAddress = getNetworkAddress('fifsAddrRegistrar', opts.network);
      const rifTokenAddress = getNetworkAddress('rifToken', opts.network);

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
