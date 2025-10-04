import { Command } from 'commander';
import { getProvider, getWallet } from '../utils/provider.js';
import { ethers } from 'ethers';
import Web3 from 'web3';
import RNS from '@rsksmart/rns';
import FIFSRegistrarData from '@rsksmart/rns-rskregistrar/FIFSRegistrarData.json' with { type: 'json' };

const registerCommand = new Command('rns:register')
  .description('Register a new RNS domain')
  .requiredOption('-d, --domain <names>', 'Domain names to register (comma-separated)')
  .option('-n, --network <network>', 'RSK network (mainnet or testnet)', 'mainnet')
  .option('-y, --years <years>', 'Registration duration in years', '1')
  .action(async (opts) => {
    try {
      const provider = getProvider(opts.network);
      const wallet = getWallet(provider);
      
      // Log wallet address
      console.log('Wallet address:', wallet.address);

      // Check RBTC balance
      const rbtcBalance = await provider.getBalance(wallet.address);
      console.log('RBTC balance:', ethers.formatEther(rbtcBalance), 'RBTC');

      // Check RIF balance
      const rifTokenAddress = opts.network === 'mainnet'
        ? '0x2acc95758f8b5f583470ba265eb685a8f45fc1d5'
        : '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe';
      const rifAbi = ['function balanceOf(address) view returns (uint256)'];
      const rifContract = new ethers.Contract(rifTokenAddress, rifAbi, provider);
      const rifBalance = await rifContract.balanceOf(wallet.address);
      console.log('RIF balance:', ethers.formatUnits(rifBalance, 18), 'RIF');

      // Initialize RNS - create Web3 provider directly from network URL
      const urls = {
        mainnet: 'https://public-node.rsk.co',
        testnet: 'https://public-node.testnet.rsk.co'
      };
      const web3Provider = new Web3.providers.HttpProvider(urls[opts.network]);
      const web3 = new Web3(web3Provider);
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY environment variable is not set');
      }
      web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
      const rns = new RNS(web3);

      // Get the FIFS registrar contract
      const registrarAddress = opts.network === 'mainnet'
        ? FIFSRegistrarData.address.rskMainnet
        : FIFSRegistrarData.address.rskTestnet;

      const registrar = new ethers.Contract(registrarAddress, FIFSRegistrarData.abi, wallet);

      const domains = opts.domain.split(',').map(d => d.trim());
      const duration = Number(opts.years); 

      for (const domain of domains) {
        // Get the domain label (remove .rsk if present)
        const label = domain.endsWith('.rsk') ? domain.slice(0, -4) : domain;
        // Hash the label to bytes32
        const labelHash = ethers.keccak256(ethers.toUtf8Bytes(label));
        console.log(`Registering domain: ${domain}`);
        const isAvailable = await rns.available(domain);
        if (!isAvailable) {
          throw new Error(`Domain ${domain} is not available`);
        }
        // Check domain price
        const price = await registrar.price(labelHash, wallet.address, duration);
        console.log('Domain price:', ethers.formatUnits(price, 18), 'RIF');

        // Check if wallet has enough RIF
        if (rifBalance < price) {
          throw new Error(`Insufficient RIF balance for domain ${domain}. Required: ${ethers.formatUnits(price, 18)} RIF`);
        }

        // Estimate gas cost
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || feeData.maxFeePerGas; // Fallback to maxFeePerGas for EIP-1559
        const gasCost = gasPrice * BigInt(3000000); // Estimate with 3M gas limit
        console.log('Estimated gas cost:', ethers.formatEther(gasCost), 'RBTC');
        
        // Check if wallet has enough RBTC
        if (rbtcBalance < gasCost) {
          throw new Error(`Insufficient RBTC balance for gas. Required: ${ethers.formatEther(gasCost)} RBTC`);
        }

        // Generate random secret for commitment
        const secret = ethers.hexlify(ethers.randomBytes(32));

        // Create commitment
        const commitment = await registrar.makeCommitment(labelHash, wallet.address, secret);

        // Commit the commitment
        await registrar.commit(commitment, { gasLimit: 3000000 });

        console.log('✅ Commitment created successfully');
        console.log('⏳ Waiting for commitment period to pass (minimum 60 seconds)');

        // Wait for commitment period (minimum age)
        await new Promise(resolve => setTimeout(resolve, 65000));

        // Register the domain
        const tx = await registrar.register(labelHash, wallet.address, secret, duration, {
          value: price,
          gasLimit: 3000000
        });

        console.log('✅ Domain registered successfully:', tx.hash);
        console.log(`📄 Domain: ${domain}`);
        console.log(`👤 Owner: ${wallet.address}`);
        console.log(`📅 Duration: ${opts.years} year(s)`);
      }
      
    } catch (err) {
      console.error('❌ Failed to register domain:', err.message);
      if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        console.error('💡 This might be due to insufficient RIF balance or the domain is not available');
      }
    }
  });

export default registerCommand;