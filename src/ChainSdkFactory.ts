import { ChainType } from './constants';

import { AptosChain } from './chains/AptosChain';
import { BitcoinChain } from './chains/BitcoinChain';
import { CardanoChain } from './chains/CardanoChain';
import { EvmChain } from './chains/EVMChain';
import { SolanaChain } from './chains/SolanaChain';
import { StarknetChain } from './chains/StarknetChain';
import { TVMChain } from './chains/TVMChain';

type ChainSdkResult<T extends ChainType> = T extends ChainType.Aptos
  ? AptosChain
  : T extends ChainType.Bitcoin
  ? BitcoinChain
  : T extends ChainType.Cardano
  ? CardanoChain
  : T extends ChainType.EVM
  ? EvmChain
  : T extends ChainType.Solana
  ? SolanaChain
  : T extends ChainType.Starknet
  ? never
  : T extends ChainType.TVM
  ? TVMChain
  : never;

export class ChainSdkFactory {
  private static readonly _sdkCache: Partial<Record<ChainType, ChainSdkResult<ChainType>>> = {};

  static getChainSdk<T extends ChainType>(chainType: T): ChainSdkResult<T> {
    switch (chainType) {
      case ChainType.Aptos:
        return this._getChainSdk(chainType, AptosChain);
      case ChainType.Bitcoin:
        return this._getChainSdk(chainType, BitcoinChain);
      case ChainType.Cardano:
        return this._getChainSdk(chainType, CardanoChain);
      case ChainType.EVM:
        return this._getChainSdk(chainType, EvmChain);
      case ChainType.Solana:
        return this._getChainSdk(chainType, SolanaChain);
      case ChainType.Starknet:
        return this._getChainSdk(chainType, StarknetChain);
      case ChainType.TVM:
        return this._getChainSdk(chainType, TVMChain);

      default:
        throw new Error(`Chain type ${chainType} is not supported`);
    }
  }

  private static _getChainSdk<T extends ChainType>(chainType: T, Ctor: { new () }): ChainSdkResult<T> {
    if (!this._sdkCache[chainType]) {
      this._sdkCache[chainType] = new Ctor();
    }
    return this._sdkCache[chainType] as ChainSdkResult<T>;
  }
}
