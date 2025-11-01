/**
 * Network configuration for RSK RNS contracts
 * Official addresses from @rsksmart/rns-sdk documentation
 */

const NETWORK_ADDRESSES = {
  mainnet: {
    rskOwner: '0x45d3e4fb311982a06ba52359d44cb4f5980e0ef1',
    fifsAddrRegistrar: '0xd9c79ced86ecf49f5e4a973594634c83197c35ab',
    rifToken: '0x2acc95758f8b5f583470ba265eb685a8f45fc1d5',
    registry: '0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5'
  },
  testnet: {
    rskOwner: '0xca0a477e19bac7e0e172ccfd2e3c28a7200bdb71',
    fifsAddrRegistrar: '0x90734bd6bf96250a7b262e2bc34284b0d47c1e8d',
    rifToken: '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe',
    registry: '0x7d284aaac6e925aad802a53c0c69efe3764597b8'
  }
};

export function getNetworkAddress(type, network) {
  return NETWORK_ADDRESSES[network]?.[type] || NETWORK_ADDRESSES.mainnet[type];
}
