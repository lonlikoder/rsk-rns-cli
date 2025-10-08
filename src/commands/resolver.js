import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { RNS } = pkg;
import { ethers } from 'ethers';
import { getProvider } from '../utils/provider.js';

const resolverCommand = new Command('rns:resolver')
  .description('Get the resolver address for a RNS domain')
  .requiredOption('-d, --domain <name>', 'Domain name')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Please set your PRIVATE_KEY in the environment variables.');
      }
      const signer = new ethers.Wallet(privateKey, provider);

      const registryAddress = opts.network === 'mainnet' ? '0x99a12be4c89cbf6cfd11d1f2c029904a7c66cc6dfs' : '0x7d284aaac6e925aad802a53c0c69efe3764597b8';
      const rns = new RNS(registryAddress, signer);

      console.log(`Connecting to ${opts.network} network...`);
      console.log(`Retrieving resolver for ${opts.domain}...`);

      const resolver = await rns.getResolver(opts.domain);

      console.log(`Resolver for ${opts.domain}: ${resolver}`);

    } catch (err) {
      console.error('Get resolver failed:', err.message);
    }
  });

export default resolverCommand;
