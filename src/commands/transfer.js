import { Command } from 'commander';
import { getNetworkAddress } from '../config/network.js'
import pkg from '@rsksmart/rns-sdk';
const { PartnerRegistrar, RNS } = pkg;
import { getProvider } from '../utils/provider.js';
import { ethers } from 'ethers';

const transferCommand = new Command('rns:transfer')
  .description('Transfer ownership of a domain')
  .requiredOption('-d, --domain <name>', 'Domain name to transfer')
  .requiredOption('-o, --owner <address>', 'New owner address')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Please set your PRIVATE_KEY in the environment variables.');
      }
      const signer = new ethers.Wallet(privateKey, provider);

      // Check if signer is the owner
      const registryAddress = getNetworkAddress('registry', opts.network);
      const rns = new RNS(registryAddress, signer);
      console.log(`Checking ownership of ${opts.domain}...`);
      const currentOwner = await rns.getOwner(opts.domain);

      if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
        throw new Error(`You are not the owner of ${opts.domain}. Current owner: ${currentOwner}`);
      }
      console.log(`✅ Verified: You are the owner of ${opts.domain}`);

      console.log(`Initializing PartnerRegistrar for ${opts.network}...`);
      const partnerRegistrar = new PartnerRegistrar(signer, opts.network);
      console.log('PartnerRegistrar initialized successfully');

      // Validate the new owner address
      if (!ethers.utils.isAddress(opts.owner)) {
        throw new Error('Invalid owner address');
      }
      console.log(`Validated new owner address: ${opts.owner}`);

      const label = opts.domain.replace('.rsk', '');
      console.log(`Transferring ownership of ${opts.domain} (label: ${label}) to ${opts.owner}...`);

      // Transfer the domain using PartnerRegistrar
      const transactionHash = await partnerRegistrar.transfer(label, opts.owner);
      console.log('✅ Transfer successful!');
      console.log(`Transaction hash: ${transactionHash}`);
      console.log(`Domain: ${opts.domain}`);
      console.log(`Transferred from: ${signer.address}`);
      console.log(`New owner: ${opts.owner}`);

    } catch (err) {
      console.error('❌ Transfer failed:', err.message);
    }
  });

export default transferCommand;
