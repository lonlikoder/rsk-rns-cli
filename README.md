# RSK RNS CLI

A comprehensive command-line interface tool for interacting with Rootstock Name Service (RNS) on the RSK blockchain. Manage your RNS domains with full lifecycle support including registration, renewal, transfers, and resolver management.

## Features

- 🔐 **Secure Wallet Integration**: Uses environment variables for private key management
- 🌐 **Multi-Network Support**: Works with both RSK Mainnet and Testnet
- 📝 **Domain Registration**: Register new RNS domains with commitment-based registration
- 🔄 **Domain Transfer**: Transfer ownership of existing RNS domains between addresses
- 🔄 **Domain Renewal**: Extend registration periods for existing domains
- 🏷️ **Resolver Management**: Set and get domain resolver addresses
- 📍 **Address Resolution**: Set resolve domains to wallet addresses and lookup resolutions
- 💰 **Balance Checks**: Automatically checks RBTC and RIF balances before transactions
- ⚡ **Gas Estimation**: Estimates gas costs before executing transactions
- 🔍 **Domain Queries**: Check availability, ownership, resolver, and pricing information

## Prerequisites

- Node.js (v18 or higher)
- An RSK-compatible wallet with RBTC and RIF tokens
- Private key for the wallet

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rsk-rns-cli
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Create an account at https://rpc.rootstock.io to get API keys for RSK mainnet and testnet

5. Edit `.env` file and add your private key and API keys:
```env
# Wallet private key
PRIVATE_KEY=your_wallet_private_key_here

# RSK RPC API Keys (get from https://rpc.rootstock.io)
RSK_MAINNET_API_KEY=your_mainnet_api_key
RSK_TESTNET_API_KEY=your_testnet_api_key
```

## Usage

### Global Installation (Optional)

You can install the CLI globally:
```bash
npm install -g .
```

Then run commands directly:
```bash
rsk --help
```

### Local Usage

Run commands using npm:
```bash
npm start -- [command] [options]
```

### Commands

#### Register RNS Domains

Register one or more RNS domains:

```bash
npm start -- rns:register -d example.rsk -n testnet -y 1
```

**Options:**
- `-d, --domain <names>`: Domain names to register (comma-separated) - **required**
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`
- `-y, --years <years>`: Registration duration in years - default: `1`

**Example:**
```bash
# Register single domain on testnet for 2 years
npm start -- rns:register -d mydomain.rsk -n testnet -y 2

# Register multiple domains on mainnet
npm start -- rns:register -d domain1.rsk,domain2.rsk,domain3.rsk
```

#### Transfer Domain Ownership

Transfer ownership of an existing RNS domain:

```bash
npm start -- rns:transfer -d example.rsk -o 0xNewOwnerAddress -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name to transfer - **required**
- `-o, --owner <address>`: New owner address - **required**
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

**Example:**
```bash
# Transfer domain to new owner on mainnet
npm start -- rns:transfer -d mydomain.rsk -o 0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59
```

#### Renew Domain Registration

Extend the registration period of an existing RNS domain:

```bash
npm start -- rns:renew -d example.rsk -y 2 -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name to renew - **required**
- `-y, --years <years>`: Number of years to extend registration - default: `1`
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

**Example:**
```bash
# Renew domain for additional 2 years on testnet
npm start -- rns:renew -d mydomain.rsk -y 2 -n testnet
```

#### Set Domain Resolution Address

Set the address that a domain resolves to:

```bash
npm start -- rns:set-addr -d example.rsk -a 0xTargetAddress -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name - **required**
- `-a, --address <address>`: Target address for resolution - **required**
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

**Example:**
```bash
# Set domain to resolve to a specific wallet address
npm start -- rns:set-addr -d mydomain.rsk -a 0x742d35Cc6634C893292Ce8bB6239C002Ad8e6b59
```

#### Domain Queries

##### Check Domain Availability

Check if a domain name is available for registration:

```bash
npm start -- rns:available -d example.rsk -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name to check - **required**
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

##### Get Registration Price

Calculate the cost to register a domain:

```bash
npm start -- rns:price -d example.rsk -y 1 -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name to check price for - **required**
- `-y, --years <years>`: Registration duration in years - default: `1`
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

##### Get Domain Owner

Find the current owner of a domain:

```bash
npm start -- rns:owner -d example.rsk -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name - **required**
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

##### Get Domain Resolver

Find the resolver contract address for a domain:

```bash
npm start -- rns:resolver -d example.rsk -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name - **required**
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

##### Resolve Domain to Address

Get the address that a domain resolves to:

```bash
npm start -- rns:resolve -d example.rsk -n testnet
```

**Options:**
- `-d, --domain <name>`: Domain name to resolve - **required**
- `-n, --network <network>`: RSK network (`mainnet` or `testnet`) - default: `mainnet`

**Examples:**
```bash
# Check if domain is available
npm start -- rns:available -d mydomain.rsk -n testnet

# Get registration price for 2 years
npm start -- rns:price -d mydomain.rsk -y 2 -n testnet

# Find current domain owner
npm start -- rns:owner -d mydomain.rsk

# Get domain resolver address
npm start -- rns:resolver -d mydomain.rsk

# Resolve domain to wallet address
npm start -- rns:resolve -d mydomain.rsk
```

## How It Works

### Domain Registration Process

1. **Balance Checks**: Verifies RBTC (for gas) and RIF (for domain payment) balances
2. **Domain Availability**: Checks if the domain is available
3. **Price Calculation**: Gets the current domain price from the registrar
4. **Commitment**: Creates and submits a commitment to the blockchain
5. **Waiting Period**: Waits for the commitment period (minimum 60 seconds)
6. **Registration**: Completes the domain registration

### Security Features

- Private keys are stored in environment variables, not in code
- Automatic balance validation before transactions
- Gas estimation to prevent failed transactions
- Input validation for addresses and domains

## Network Configuration

The CLI now uses Rootstock's RPC API service for improved reliability. You need to obtain API keys from https://rpc.rootstock.io

### Mainnet
- RPC URL: `https://rpc.rootstock.io/{API_KEY}`
- Registry: `0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5`
- RIF Token: `0x2acc95758f8b5f583470ba265eb685a8f45fc1d5`
- RSK Owner: `0x45d3e4fb311982a06ba52359d44cb4f5980e0ef1`
- FIFS Registrar: `0xd9c79ced86ecf49f5e4a973594634c83197c35ab`

### Testnet
- RPC URL: `https://rpc.testnet.rootstock.io/{API_KEY}`
- Registry: `0x7d284aaac6e925aad802a53c0c69efe3764597b8`
- RIF Token: `0x19f64674d8a5b4e652319f5e239efd3bc969a1fe`
- RSK Owner: `0xca0a477e19bac7e0e172ccfd2e3c28a7200bdb71`
- FIFS Registrar: `0x90734bd6bf96250a7b262e2bc34284b0d47c1e8d`

## Requirements

### Token Requirements

- **RBTC**: Required for gas fees (transaction costs)
- **RIF**: Required for domain registration payments

### Minimum Balances

The tool will automatically check and validate:
- Sufficient RBTC for gas estimation (typically 0.001-0.002 RBTC for both commit and register transactions)
- Sufficient RIF for domain registration cost (typically 2 RIF for .rsk domains)

### Getting Testnet Tokens

For testing on RSK Testnet:

1. **Get RBTC**: Use the Rootstock Faucet - https://faucet.rootstock.io
2. **Get RIF**: Use the RIF Faucet - https://faucet.rifos.org

**Steps:**
1. Copy your wallet address (`0x97A881df71Ab6d251837eD99b1f33dF1cc657a73`)
2. Visit the faucet websites
3. Paste your address and request tokens
4. Wait for the transactions to confirm (usually takes a few minutes)

### Mainnet Tokens

For mainnet usage:
- Purchase RBTC from exchanges
- Purchase RIF from exchanges that support RSK tokens
- Ensure you have sufficient balance for both gas and domain registration

## Error Handling

Common errors and solutions:

- **"PRIVATE_KEY missing"**: Set your private key in `.env` file
- **"Insufficient RIF balance"**: Add more RIF tokens to your wallet (use faucets for testnet)
- **"Insufficient RBTC balance"**: Add more RBTC for gas fees (use faucets for testnet)
- **"Domain not available"**: Choose a different domain name
- **"Invalid owner address"**: Provide a valid Ethereum address
- **"Could not fetch RIF balance"**: This usually means your wallet has no RIF tokens
- **"could not decode result data"**: Typically indicates the RIF token contract call failed due to empty balance

### Troubleshooting Tips

1. **Check your balances first**:
   ```bash
   npm start -- rns:register -d test.rsk -n testnet
   ```
   The tool will show your RBTC and RIF balances before attempting registration.

2. **Ensure faucet transactions are confirmed** - wait a few minutes after requesting tokens

3. **Verify network settings** - make sure you're using the correct network (testnet/mainnet)

4. **Check domain availability** - some domains may already be registered

## Development

### Project Structure

```
rsk-rns-cli/
├── bin/
│   └── rsk.js                    # CLI entry point
├── src/
│   ├── index.js                  # Main CLI program
│   ├── commands/
│   │   ├── register.js          # Domain registration command
│   │   ├── transfer.js          # Domain transfer command
│   │   ├── renew.js             # Domain renewal command
│   │   ├── set-addr.js          # Set domain resolution address
│   │   ├── resolve.js           # Resolve domain to address
│   │   ├── available.js         # Check domain availability
│   │   ├── price.js             # Get domain registration price
│   │   ├── owner.js             # Get domain owner
│   │   └── resolver.js          # Get domain resolver address
│   └── utils/
│       └── provider.js          # Blockchain provider utilities
├── .env.example                  # Environment variables template
├── package.json                  # Project dependencies and scripts
├── test.js                       # Test script for RNS operations
└── README.md                     # This documentation
```

### Dependencies

- `@rsksmart/rns`: RNS SDK for domain operations
- `@rsksmart/rns-registry`: RNS registry contracts
- `@rsksmart/rns-rskregistrar`: RNS registrar contracts
- `commander`: CLI framework
- `dotenv`: Environment variable management
- `ethers`: Ethereum library for blockchain interactions
- `web3`: Web3 library for RNS compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the error messages and common solutions above
2. Ensure you have sufficient token balances
3. Verify your private key is correctly set in `.env`
4. Check that you're using the correct network
