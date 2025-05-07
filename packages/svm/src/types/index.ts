import type { Cluster } from '@solana/web3.js';

export type FetchTokenVersionOptions = {
  clusterOrEndpoint?: Cluster | string;
};

export type FetchTokenMetadataOptions = FetchTokenVersionOptions & {
  fetchOffchainMetadata?: boolean;
};

export type SplTokenFullMetadata = {
  supply: bigint;
  decimals: number;
  address: string;
  mintAuthority?: string;
  name?: string;
  symbol?: string;
  uri?: string;
  // offchain metadata
  description?: string;
  image?: string;
};
