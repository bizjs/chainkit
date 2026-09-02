import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import type { SuiNetwork } from '../types';

const SUI_NETWORKS: readonly string[] = ['mainnet', 'testnet', 'devnet'];

export function _getPublicKeyBuffer(publicKey: string): Buffer {
  const hasPrefix = publicKey.startsWith('0x') || publicKey.startsWith('00');
  const key = hasPrefix ? publicKey.slice(2, 66) : publicKey;
  return Buffer.from(key, 'hex');
}

export function _getEd25519PublicKey(publicKey: string): Ed25519PublicKey {
  const pubKey = new Ed25519PublicKey(_getPublicKeyBuffer(publicKey));
  return pubKey;
}

/**
 * Create a gRPC client for a named network, or for a custom gRPC-web endpoint.
 * A custom endpoint is tagged as mainnet; the tag only affects chain identity, not reads.
 */
export function _getClient(clusterOrEndpoint: SuiNetwork | string = 'mainnet') {
  if (SUI_NETWORKS.includes(clusterOrEndpoint)) {
    const network = clusterOrEndpoint as SuiNetwork;
    return new SuiGrpcClient({ network, baseUrl: `https://fullnode.${network}.sui.io:443` });
  }
  return new SuiGrpcClient({ network: 'mainnet', baseUrl: clusterOrEndpoint });
}
