import {
  ChainSdkFactory,
  ChainType,
  AptosChain,
  BitcoinChain,
  CardanoChain,
  EvmChain,
  SolanaChain,
  StarknetChain,
  TVMChain,
} from '../src';

describe('ChainSdkFactory', () => {
  test('should return chain sdk instance', () => {
    const list = [
      [ChainType.Aptos, AptosChain],
      [ChainType.Bitcoin, BitcoinChain],
      [ChainType.Cardano, CardanoChain],
      [ChainType.EVM, EvmChain],
      [ChainType.Solana, SolanaChain],
      [ChainType.Starknet, StarknetChain],
      [ChainType.TVM, TVMChain],
    ];
    for (const [type, chain] of list) {
      const sdk = ChainSdkFactory.getChainSdk(type as ChainType);
      expect(sdk).toBeInstanceOf(chain);
    }
  });

  test('should throw error if chain type is not supported', () => {
    const chainType = Math.random().toString(36).substring(7) as ChainType;
    expect(() => ChainSdkFactory.getChainSdk(chainType as ChainType)).toThrow(
      `Chain type ${chainType} is not supported`,
    );
  });
});
