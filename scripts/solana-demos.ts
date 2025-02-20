import { ChainSdkFactory, ChainType } from '../src';

const sdk = ChainSdkFactory.getChainSdk(ChainType.Solana)!;

async function demos() {
  const tokenAddress = 'AwVaHHnEEQKBXYVUpnV3BgBmEN2iHYji1jhixJnJZqTt';
  const tokenAddress2022 = 'GWSMVth75D4NmmsoqFMG6pj5oUo4dvjmnWk1C1XFN9hR';

  const tm = await sdk.fetchTokenMetadata(tokenAddress, { clusterOrEndpoint: 'devnet' });
  console.log('tm', tm);

  const tm2 = await sdk.fetchTokenMetadata(tokenAddress2022, {
    clusterOrEndpoint: 'devnet',
    fetchOffchainMetadata: true,
  });
  console.log('tm2', tm2);
}

demos();
