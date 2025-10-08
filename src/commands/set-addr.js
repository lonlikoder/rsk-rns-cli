import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { AddrResolver } = pkg;
import { ethers } from 'ethers';
import { getProvider } from '../utils/provider.js';

const setAddrCommand = new Command('rns:set-addr')
  .description('Set the resolved address for a RNS domain')
  .requiredOption('-d, --domain <name>', 'Domain name')
  .requiredOption('-a, --address <address>', 'Address to resolve to')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Please set your PRIVATE_KEY in the environment variables.');
      }
      const signer = new ethers.Wallet(privateKey, provider);

      const registryAddress = opts.network === 'mainnet' ? '0x99a12be4c89cbf6cfd11d1f2c029904a7c66cc6dfs' : '0x7d284aaac6e925aad802a53c0c69efe3764597b8'; // actual registry address

      console.log(`Initializing AddrResolver for ${opts.network}...`);
      const addrResolver = new AddrResolver(registryAddress, signer);

      console.log(`Setting resolved address for ${opts.domain} to ${opts.address}...`);
      const tx = await addrResolver.setAddr(opts.domain, opts.address);
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();

      console.log('✅ Address set successfully!');
      console.log(`Domain: ${opts.domain}`);
      console.log(`Resolves to: ${opts.address}`);
      console.log(`Transaction: ${tx.hash}`);

    } catch (err) {
      console.error('Set address failed:', err.message);
    }
  });

export default setAddrCommand;
