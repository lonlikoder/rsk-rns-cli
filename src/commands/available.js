import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { RSKRegistrar } = pkg;
import { ethers } from 'ethers';
import { getProvider } from '../utils/provider.js';
import { getNetworkAddress } from '../config/network.js';

const availableCommand = new Command('rns:available')
  .description('Check if a RNS domain is available')
  .requiredOption('-d, --domain <name>', 'Domain name to check')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
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
      console.log(`Checking if ${opts.domain} is available...`);

      const label = opts.domain.replace('.rsk', '');
      const available = await rskRegistrar.available(label);

      console.log(`Result: Domain ${opts.domain} is ${available ? 'available' : 'not available for registration'}`);

    } catch (err) {
      console.error('Check availability failed:', err.message);
    }
  });

export default availableCommand;
