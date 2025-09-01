import { Account, Aptos, AptosConfig, Ed25519PublicKey, Network, type AptosSettings } from '@aptos-labs/ts-sdk';
import { naclVerify } from '@bizjs/chainkit-utils';
import { Buffer } from 'buffer';

import { _getPublicKeyBuffer } from './_internal';
import type { FAMetadata, FetchFAMetadataOptions, Mutable } from '../types';

/**
 * Verify message with public key and signature
 * @param publicKey public key, not address
 * @param message
 * @param signature
 * @returns
 */
export function verifyMessage(publicKey: string, message: string, signature: string): boolean {
  return naclVerify(Buffer.from(message), Buffer.from(signature, 'hex'), _getPublicKeyBuffer(publicKey));
}

/**
 * Get derived address from public key
 * @param publicKey
 * @returns
 */
export function getDerivedAddress(publicKey: string): string {
  // old implementation using 'aptos' package
  // const uint8Key = HexString.ensure(publicKey).toUint8Array();
  // const ed25519PubKey = new TxnBuilderTypes.Ed25519PublicKey(uint8Key);
  // const authenticationKey = TxnBuilderTypes.AuthenticationKey.fromEd25519PublicKey(ed25519PubKey);
  // return authenticationKey.derivedAddress().hex();
  const pubKey = new Ed25519PublicKey(_getPublicKeyBuffer(publicKey));
  return Account.authKey({ publicKey: pubKey }).derivedAddress().bcsToHex().toString();
}

export async function fetchFAMetadata(accountAddress: string, options?: FetchFAMetadataOptions): Promise<FAMetadata> {
  const settings: Mutable<AptosSettings> = {};
  if (options?.fullnode) {
    settings.fullnode = options.fullnode;
  } else if (options?.network) {
    settings.network = options.network;
  } else {
    settings.network = Network.MAINNET; // Default to mainnet if no options provided
  }

  const aptos = new Aptos(new AptosConfig(settings));

  const metadata = await aptos.getAccountResource({
    accountAddress,
    resourceType: '0x1::fungible_asset::Metadata',
  });
  if (!metadata) {
    throw new Error(`No metadata found for address: ${accountAddress}`);
  }
  if (options?.includeTotalSupply) {
    const totalSupplyResource = await aptos.getAccountResource({
      accountAddress,
      resourceType: '0x1::fungible_asset::ConcurrentSupply',
    });
    const totalSupply = totalSupplyResource?.current?.value;
    if (typeof totalSupply !== 'string') {
      throw new Error(`Invalid total supply value for address: ${accountAddress}`);
    }
    metadata.totalSupply = BigInt(totalSupply);
  }
  return metadata;
}
