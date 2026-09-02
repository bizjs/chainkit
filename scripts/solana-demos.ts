// import { ChainSdkFactory, ChainType } from '../src';

// const sdk = ChainSdkFactory.getChainSdk(ChainType.Solana)!;

const arr =
  '12,6,160,171,184,91,199,111,85,186,104,134,95,8,203,1,45,211,204,48,159,58,39,73,125,149,168,202,222,155,227,66'
    .split(',')
    .map((i) => Number(i));
const s = Buffer.from(arr).toString('hex');
console.log('s', s);


// async function demos() {
//   const tokenAddress = 'AwVaHHnEEQKBXYVUpnV3BgBmEN2iHYji1jhixJnJZqTt';
//   const tokenAddress2022 = 'GWSMVth75D4NmmsoqFMG6pj5oUo4dvjmnWk1C1XFN9hR';

//   const tm = await sdk.fetchTokenMetadata(tokenAddress, { clusterOrEndpoint: 'devnet' });
//   console.log('tm', tm);

//   const tm2 = await sdk.fetchTokenMetadata(tokenAddress2022, {
//     clusterOrEndpoint: 'devnet',
//     fetchOffchainMetadata: true,
//   });
//   console.log('tm2', tm2);
// }

// demos();
