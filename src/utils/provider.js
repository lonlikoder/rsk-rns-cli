import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export function getProvider(network = 'mainnet') {
  const urls = {
    mainnet: 'https://public-node.rsk.co',
    testnet: 'https://public-node.testnet.rsk.co'
  };
  return new ethers.providers.JsonRpcProvider(urls[network]);
}

export function getWallet(provider) {
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY missing. Add it to your .env file.');
    process.exit(1);
  }
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}
