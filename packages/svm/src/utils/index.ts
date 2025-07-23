import bs58 from 'bs58';
import { verifyAsync } from '@noble/ed25519';
import { naclVerify } from '@bizjs/chainkit-utils';

import type { FetchTokenMetadataOptions, SplTokenFullMetadata } from '../types';
import {
  _fetchMetadataJson,
  _getConnection,
  _getSplToken2022Metadata,
  _getSplTokenMetadata,
  _getTokenProgramAndParsedAccountData,
} from './_internal';
import { SplTokenVersion } from '../constants';

export async function verifyMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
  const sig = Buffer.from(bs58.decode(signature));
  return naclVerify(Buffer.from(message), sig, Buffer.from(bs58.decode(publicKey)));
}

/**
 *
 * @param publicKey base58 encoded public key
 * @param message base58 encoded message
 * @param signature base58 encoded signature
 * @returns
 */
export async function verifyOffchainMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
  const messageBytes = bs58.decode(message);
  const pubkeyBytes = bs58.decode(publicKey);
  const signatureBytes = bs58.decode(signature);

  return verifyAsync(signatureBytes, messageBytes, pubkeyBytes);
}

/**
 * fetch Solana SPL version: spl-token or spl-token-2022
 * @param tokenAddress
 * @param options
 * @returns
 */
export async function fetchTokenVersion(tokenAddress: string, options?: FetchTokenMetadataOptions) {
  const conn = _getConnection(options?.clusterOrEndpoint);
  const data = await _getTokenProgramAndParsedAccountData(conn, tokenAddress);
  return data ? { name: data.name, programId: data.programId } : null;
}

export async function fetchTokenMetadata(tokenAddress: string, options?: FetchTokenMetadataOptions) {
  const conn = _getConnection(options?.clusterOrEndpoint);
  const tokenProgramAndParsedAccountData = await _getTokenProgramAndParsedAccountData(conn, tokenAddress);
  let fullMetadata: SplTokenFullMetadata | null = null;
  if (tokenProgramAndParsedAccountData?.name === SplTokenVersion.SplToken) {
    fullMetadata = await _getSplTokenMetadata(
      conn,
      tokenAddress,
      tokenProgramAndParsedAccountData.parsedMintAccountData,
    );
  } else if (tokenProgramAndParsedAccountData?.name === SplTokenVersion.SplToken2022) {
    fullMetadata = await _getSplToken2022Metadata(conn, tokenAddress);
  } else {
    return null;
  }
  if (fullMetadata && options?.fetchOffchainMetadata) {
    const metadata = await _fetchMetadataJson(fullMetadata.uri!);
    if (metadata) {
      fullMetadata.description = metadata.description;
      fullMetadata.image = metadata.image;
    }
  }
  return fullMetadata;
}
