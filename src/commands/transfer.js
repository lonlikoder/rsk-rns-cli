import { Command } from 'commander';
import { getProvider, getWallet } from '../utils/provider.js';
import Web3 from 'web3';
import RNS from '@rsksmart/rns';

const transferCommand = new Command('rns:transfer')
  .description('Transfer ownership of a domain')
  .requiredOption('-d, --domain <name>', 'Domain name to transfer')
  .requiredOption('-o, --owner <address>', 'New owner address')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const wallet = getWallet(provider);
      
      // Initialize RNS - create Web3 provider directly from network URL
      const urls = {
        mainnet: 'https://public-node.rsk.co',
        testnet: 'https://public-node.testnet.rsk.co'
      };
      const web3Provider = new Web3.providers.HttpProvider(urls[opts.network]);
      const web3 = new Web3(web3Provider);
      web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
      const rns = new RNS(web3);

      // Wait for RNS to compose
      await rns.compose();

      // Validate the new owner address
      if (!web3.utils.isAddress(opts.owner)) {
        throw new Error('Invalid owner address');
      }

      // Transfer the domain using RNS SDK
      const tx = await rns.setOwner(opts.domain, opts.owner);

      console.log('✅ Domain transferred successfully:', tx.transactionHash);
      console.log(`📄 Domain: ${opts.domain}`);
      console.log(`👤 From: ${wallet.address}`);
      console.log(`👤 To: ${opts.owner}`);
      
    } catch (err) {
      console.error('❌ Failed to transfer domain:', err.message);
      if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        console.error('💡 This might be due to insufficient RIF balance or you are not the owner of the domain');
      }
    }
  });

export default transferCommand;
