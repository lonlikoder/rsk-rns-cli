import { Command } from 'commander';
import pkg from '@rsksmart/rns-sdk';
const { RSKRegistrar } = pkg;
import { ethers, BigNumber } from 'ethers';
import { getProvider } from '../utils/provider.js';
import { getNetworkAddress } from '../config/network.js';

const registerCommand = new Command('rns:register')
  .description('Register a new RNS domain')
  .requiredOption('-d, --domain <name>', 'Domain name to register')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .option('-y, --years <years>', 'Registration duration in years', '1')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Please set your PRIVATE_KEY in the environment variables.');
      }
      const signer = new ethers.Wallet(privateKey, provider);

      // RSK addresses based on network
      const rskOwnerAddress = getNetworkAddress('rskOwner', opts.network);
      const fifsAddrRegistrarAddress = getNetworkAddress('fifsAddrRegistrar', opts.network);
      const rifTokenAddress = getNetworkAddress('rifToken', opts.network);

      const rskRegistrar = new RSKRegistrar(rskOwnerAddress, fifsAddrRegistrarAddress, rifTokenAddress, signer);

      const label = opts.domain.replace('.rsk', '');
      console.log(`Checking availability for ${opts.domain}...`);
      const available = await rskRegistrar.available(label);

      if (!available) {
        throw new Error('Domain is not available');
      }
      console.log(`${opts.domain} is available for registration`);

      const duration = BigNumber.from(opts.years);
      console.log(`Getting price for ${opts.domain} for ${opts.years} years...`);
      const price = await rskRegistrar.price(label, duration);
      console.log(`Registration price: ${price.toString()} RIF`);

      // Check RIF balance
      const rifAbi = ['function balanceOf(address) view returns (uint256)'];
      const rifContract = new ethers.Contract(rifTokenAddress, rifAbi, provider);
      const rifBalance = await rifContract.balanceOf(signer.address);
      console.log(`Your RIF balance: ${ethers.utils.formatUnits(rifBalance, 18)} RIF`);

      if (rifBalance < price) {
        throw new Error(`Insufficient RIF balance. Need: ${ethers.utils.formatUnits(price, 18)} RIF, Have: ${ethers.utils.formatUnits(rifBalance, 18)} RIF`);
      }

      // Perform registration
      console.log(`Starting registration process for ${opts.domain}...`);
      const { makeCommitmentTransaction, secret, canReveal } = await rskRegistrar.commitToRegister(label, signer.address);

      console.log(`Sending commitment transaction for ${opts.domain}...`);
      await makeCommitmentTransaction.wait();
      console.log(`Commitment transaction confirmed: ${makeCommitmentTransaction.hash}`);

      console.log('Waiting for commitment period to pass (minimum 60 seconds)...');

      // Wait for commitment to be revealable (poll every 10s for up to 2 min)
      let commitmentReady = false;
      let attempts = 0;
      for (let i = 0; i < 12; i++) {
        commitmentReady = await canReveal();
        attempts = i + 1;
        if (commitmentReady) break;
        console.log(`Attempt ${attempts}/12: Commitment not ready, waiting 10 seconds...`);
        await new Promise(res => setTimeout(res, 10000));
      }

      if (!commitmentReady) throw new Error('Commitment not ready to reveal after 12 attempts.');

      console.log(`Commitment ready after ${attempts} attempts. Revealing and registering domain...`);

      const registerTx = await rskRegistrar.register(
        label,
        signer.address,
        secret,
        duration,
        price
      );
      console.log(`Registration transaction sent: ${registerTx.hash}`);
      await registerTx.wait();
      console.log(`✅ Domain ${opts.domain} registered successfully!`);
      console.log(`Transaction hash: ${registerTx.hash}`);
      console.log(`Owner: ${signer.address}`);
      console.log(`Expires: ${new Date(Date.now() + Number(duration) * 365 * 24 * 3600 * 1000).toISOString()}`);

    } catch (err) {
      console.error('Registration failed:', err.message);
    }
  });

export default registerCommand;
