import { clusterApiUrl, Connection, PublicKey, type Cluster, type ParsedAccountData } from '@solana/web3.js';
import { ExtensionType, getExtensionData, getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { SplTokenVersion } from '../constants';
import type { SplTokenFullMetadata } from '../types';
import { unpack } from '@solana/spl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fetchMetadata, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';

export async function _getTokenProgramAndParsedAccountData(conn: Connection, tokenAddress: string) {
  const tokenMintAddress = new PublicKey(tokenAddress);
  const parsedMintAccountInfo = await conn.getParsedAccountInfo(tokenMintAddress);
  const parsedMintAccountData = parsedMintAccountInfo.value?.data as ParsedAccountData;
  if (parsedMintAccountData?.program === SplTokenVersion.SplToken) {
    return {
      name: SplTokenVersion.SplToken,
      programId: TOKEN_PROGRAM_ID,
      parsedMintAccountData,
    };
  } else if (parsedMintAccountData?.program === SplTokenVersion.SplToken2022) {
    return {
      name: SplTokenVersion.SplToken2022,
      programId: TOKEN_2022_PROGRAM_ID,
      parsedMintAccountData,
    };
  }
  return null;
}

export function _getConnection(clusterOrEndpoint: Cluster | string | undefined) {
  let endpoint: string;
  try {
    endpoint = clusterApiUrl((clusterOrEndpoint as Cluster) ?? 'mainnet-beta');
  } catch {
    endpoint = clusterOrEndpoint as string;
  }

  const conn = new Connection(endpoint);
  return conn;
}

export async function _fetchMetadataJson(url: string) {
  try {
    const body: any = await fetch(url).then((res) => res.json());
    return { description: body.description, image: body.image };
  } catch (e) {
    console.error(e);
    throw new Error('Failed to fetch metadata json');
  }
}

export async function _getSplToken2022Metadata(conn: Connection, tokenAddress: string): Promise<SplTokenFullMetadata> {
  const mintAddress = new PublicKey(tokenAddress);
  // 获取 mintInfo
  const mintInfo = await getMint(conn, mintAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);

  const data = getExtensionData(ExtensionType.TokenMetadata, mintInfo.tlvData);
  const metadata = data ? unpack(data) : null;

  const fullMetadata: SplTokenFullMetadata = {
    supply: mintInfo.supply,
    decimals: mintInfo.decimals,
    address: mintAddress.toBase58(),
    mintAuthority: mintInfo.mintAuthority?.toBase58(),
    name: metadata?.name,
    symbol: metadata?.symbol,
    uri: metadata?.uri,
  };

  return fullMetadata;
}

export async function _getSplTokenMetadata(
  conn: Connection,
  tokenAddress: string,
  parsedMintAccountData: ParsedAccountData,
): Promise<SplTokenFullMetadata> {
  const umi = createUmi(conn);
  const metadataPda = findMetadataPda(umi, {
    mint: publicKey(tokenAddress),
  });
  const metadata = await fetchMetadata(umi, metadataPda);

  const info = parsedMintAccountData?.parsed.info;

  const fullMetadata: SplTokenFullMetadata = {
    supply: BigInt(info.supply),
    decimals: info.decimals,
    address: tokenAddress,
    mintAuthority: info.mintAuthority,
    name: metadata?.name,
    symbol: metadata?.symbol,
    uri: metadata?.uri,
  };

  return fullMetadata;
}
