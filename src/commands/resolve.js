import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { AddrResolver } = pkg;
import { ethers } from 'ethers';
import { getProvider } from '../utils/provider.js';
import { getNetworkAddress } from '../config/network.js';

const resolveCommand = new Command('rns:resolve')
  .description('Resolve a domain to its address')
  .requiredOption('-d, --domain <name>', 'Domain name to resolve')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Please set your PRIVATE_KEY in the environment variables.');
      }
      const signer = new ethers.Wallet(privateKey, provider);

      const registryAddress = getNetworkAddress('registry', opts.network);
      console.log(`Connecting to ${opts.network} network...`);
      console.log(`Resolving domain ${opts.domain} to address...`);

      const addrResolver = new AddrResolver(registryAddress, signer);

      const addr = await addrResolver.addr(opts.domain);

      console.log(`Resolved address for ${opts.domain}: ${addr}`);

    } catch (err) {
      console.error('Resolve failed:', err.message);
    }
  });

export default resolveCommand;
