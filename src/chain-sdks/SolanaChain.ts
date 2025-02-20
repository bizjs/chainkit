import bs58 from 'bs58';
import { Cluster, clusterApiUrl, Connection, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getMint, getExtensionData, ExtensionType } from '@solana/spl-token';
import { unpack } from '@solana/spl-token-metadata';
import { fetchMetadata, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';

import { naclSignDetachedVerify } from '../utils';
import { FetchTokenMetadataOptions, SplTokenFullMetadata } from './types/solana-chain-types';

export enum SplTokenVersion {
  SplToken = 'spl-token',
  SplToken2022 = 'spl-token-2022',
}

export class SolanaChain {
  async verifyMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
    const sig = Buffer.from(bs58.decode(signature));
    return naclSignDetachedVerify(Buffer.from(message), sig, Buffer.from(bs58.decode(publicKey)));
  }

  async getAddress(publicKey: string): Promise<string> {
    return publicKey;
  }

  /**
   * fetch Solana SPL version: spl-token or spl-token-2022
   * @param tokenAddress
   * @param options
   * @returns
   */
  async fetchTokenVersion(tokenAddress: string, options?: FetchTokenMetadataOptions) {
    const conn = this._getConnection(options?.clusterOrEndpoint);
    const data = await this._getTokenProgramAndParsedAccountData(conn, tokenAddress);
    return data ? { name: data.name, programId: data.programId } : null;
  }

  async fetchTokenMetadata(tokenAddress: string, options?: FetchTokenMetadataOptions) {
    const conn = this._getConnection(options?.clusterOrEndpoint);
    const tokenProgramAndParsedAccountData = await this._getTokenProgramAndParsedAccountData(conn, tokenAddress);
    let fullMetadata: SplTokenFullMetadata | null = null;
    if (tokenProgramAndParsedAccountData.name === SplTokenVersion.SplToken) {
      fullMetadata = await this._getSplTokenMetadata(
        conn,
        tokenAddress,
        tokenProgramAndParsedAccountData.parsedMintAccountData,
      );
    } else if (tokenProgramAndParsedAccountData.name === SplTokenVersion.SplToken2022) {
      fullMetadata = await this._getSplToken2022Metadata(conn, tokenAddress);
    } else {
      return null;
    }
    if (fullMetadata && options?.fetchOffchainMetadata) {
      const metadata = await this._fetchMetadataJson(fullMetadata.uri);
      if (metadata) {
        fullMetadata.description = metadata.description;
        fullMetadata.image = metadata.image;
      }
    }
    return fullMetadata;
  }

  private async _getSplTokenMetadata(
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

  private async _getSplToken2022Metadata(conn: Connection, tokenAddress: string): Promise<SplTokenFullMetadata> {
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

  private async _fetchMetadataJson(url: string) {
    try {
      const body = await fetch(url).then((res) => res.json());
      return { description: body.description, image: body.image };
    } catch (e) {
      console.error('Failed to fetch metadata json', e);
      return null;
    }
  }

  private _getConnection(clusterOrEndpoint: Cluster | string) {
    let endpoint: string;
    try {
      endpoint = clusterApiUrl((clusterOrEndpoint as Cluster) ?? 'mainnet-beta');
    } catch {
      endpoint = clusterOrEndpoint as string;
    }

    const conn = new Connection(endpoint);
    return conn;
  }

  private async _getTokenProgramAndParsedAccountData(conn: Connection, tokenAddress: string) {
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
}
