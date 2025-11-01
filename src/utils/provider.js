import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export function getProvider(network = 'mainnet') {
  const apiKeys = {
    mainnet: process.env.RSK_MAINNET_API_KEY,
    testnet: process.env.RSK_TESTNET_API_KEY
  };

  const apiKey = apiKeys[network];
  if (!apiKey) {
    console.error(`❌ RSK_${network.toUpperCase()}_API_KEY missing. Add it to your .env file.`);
    console.error(`   Get your API key at: https://rpc.rootstock.io`);
    process.exit(1);
  }

  const urls = {
    mainnet: `https://rpc.rootstock.io/${apiKey}`,
    testnet: `https://rpc.testnet.rootstock.io/${apiKey}`
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
