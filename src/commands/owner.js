import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { RNS } = pkg;
import { ethers } from 'ethers';
import { getProvider } from '../utils/provider.js';

const ownerCommand = new Command('rns:owner')
  .description('Get the owner of a RNS domain')
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
      console.log(`Retrieving owner of ${opts.domain}...`);

      const controller = await rns.getOwner(opts.domain);

      console.log(`Owner of ${opts.domain}: ${controller}`);

    } catch (err) {
      console.error('Get owner failed:', err.message);
    }
  });

export default ownerCommand;
