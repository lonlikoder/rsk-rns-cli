import { Command } from 'commander';
import { getNetworkAddress } from '../config/network.js'
import pkg from '@rsksmart/rns-sdk';
const { PartnerRegistrar, RSKRegistrar } = pkg;
import { ethers, BigNumber } from 'ethers';
import { getProvider } from '../utils/provider.js';

const renewCommand = new Command('rns:renew')
  .description('Renew a RNS domain')
  .requiredOption('-d, --domain <name>', 'Domain name to renew')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .option('-y, --years <years>', 'Renewal duration in years', '1')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Please set your PRIVATE_KEY in the environment variables.');
      }
      const signer = new ethers.Wallet(privateKey, provider);

      // RSK addresses based on network
      const partnerRegistrar = new PartnerRegistrar(signer, opts.network);

      const label = opts.domain.replace('.rsk', '');
      console.log(`Renewing domain: ${opts.domain} (label: ${label})`);
      const duration = BigNumber.from(opts.years);
      console.log(`Renewal duration: ${opts.years} years`);

      // Get the price
      const rifTokenAddress = getNetworkAddress('rifToken', opts.network);
      const rifAbi = ['function balanceOf(address) view returns (uint256)'];
      const rifContract = new ethers.Contract(rifTokenAddress, rifAbi, provider);
      const price = await rifContract.balanceOf(signer.address); // Note: actual price logic

      // Check RIF balance
      const rifBalance = await rifContract.balanceOf(signer.address);
      console.log(`Your RIF balance: ${ethers.utils.formatUnits(rifBalance, 18)} RIF`);

      if (rifBalance < price) {
        throw new Error(`Insufficient RIF balance for renewal. Need: ${ethers.utils.formatUnits(price, 18)} RIF`);
      }

      console.log(`Sending renewal transaction for ${opts.domain}...`);
      const transactionHash = await partnerRegistrar.renew(label, duration, price);
      console.log('✅ Renewal successful!');
      console.log(`Transaction hash: ${transactionHash}`);
      console.log(`Domain: ${opts.domain}`);
      console.log(`Renewed for: ${opts.years} years`);

    } catch (err) {
      console.error('Renewal failed:', err.message);
    }
  });

export default renewCommand;
