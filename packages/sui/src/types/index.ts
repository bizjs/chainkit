export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet';

export type FetchTokenMetadataOptions = {
  /** Named network, or a custom gRPC-web endpoint URL */
  clusterOrEndpoint?: SuiNetwork | string;
};
