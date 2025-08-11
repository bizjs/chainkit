import type { getFullnodeUrl } from '@mysten/sui/client';

export type FetchTokenMetadataOptions = {
  clusterOrEndpoint?: Parameters<typeof getFullnodeUrl>[0] | string;
};
