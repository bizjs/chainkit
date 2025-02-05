import { ChainType } from './constants';

import { AptosChain } from './chain-sdks/AptosChain';
import { BitcoinChain } from './chain-sdks/BitcoinChain';
import { CardanoChain } from './chain-sdks/CardanoChain';
import { EvmChain } from './chain-sdks/EVMChain';
import { SolanaChain } from './chain-sdks/SolanaChain';
import { StarknetChain } from './chain-sdks/StarknetChain';
import { TVMChain } from './chain-sdks/TVMChain';

type ChainSdkMap = {
  [ChainType.Aptos]: AptosChain;
  [ChainType.Bitcoin]: BitcoinChain;
  [ChainType.Cardano]: CardanoChain;
  [ChainType.EVM]: EvmChain;
  [ChainType.Solana]: SolanaChain;
  [ChainType.Starknet]: StarknetChain;
  [ChainType.TVM]: TVMChain;
};

export class ChainSdkFactory {
  private static readonly _sdkMap: Partial<ChainSdkMap> = {};

  static getChainSdk<T extends ChainType>(chainType: T) {
    if (!this._sdkMap[chainType]) {
      switch (chainType) {
        case ChainType.Aptos:
          this._sdkMap[ChainType.Aptos] = new AptosChain();
          break;
        case ChainType.Bitcoin:
          this._sdkMap[ChainType.Bitcoin] = new BitcoinChain();
          break;
        case ChainType.Cardano:
          this._sdkMap[ChainType.Cardano] = new CardanoChain();
          break;
        case ChainType.EVM:
          this._sdkMap[ChainType.EVM] = new EvmChain();
          break;
        case ChainType.Solana:
          this._sdkMap[ChainType.Solana] = new SolanaChain();
          break;
        case ChainType.Starknet:
          this._sdkMap[ChainType.Starknet] = new StarknetChain();
          break;
        case ChainType.TVM:
          this._sdkMap[ChainType.TVM] = new TVMChain();
          break;

        default:
          throw new Error(`Chain type ${chainType} is not supported`);
      }
    }
    return this._sdkMap[chainType];
  }
}
