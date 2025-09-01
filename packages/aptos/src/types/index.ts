import type { Network } from '@aptos-labs/ts-sdk';

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export interface FAMetadata {
  decimals: number;
  icon_uri: string;
  name: string;
  project_uri: string;
  symbol: string;
  totalSupply?: bigint;
}

export type FetchFAMetadataOptions = { fullnode?: string; network?: Network; includeTotalSupply?: boolean };
