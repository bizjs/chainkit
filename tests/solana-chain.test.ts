import { SolanaChain, ChainSdkFactory, ChainType } from '../src';

describe('solana-chain', () => {
  let sdk: SolanaChain;

  beforeEach(() => {
    sdk = ChainSdkFactory.getChainSdk(ChainType.Solana)!;
  });

  const testData = {
    message: 'Welcome to EthSign',
    publicKey: '6Akozr9epukDjDdgTqz1npeEVCC2KVUywDDzEw7ate4',
    signature: '4KAxMirt5LNzc2XnQmZDb1qH9mtrTCgmKRVSmMiioqnswpNZosPSPM7dRspALZeRYa8Vr9iAykZ4ebD4gB66TvK4',
    address: '6Akozr9epukDjDdgTqz1npeEVCC2KVUywDDzEw7ate4',
  };

  test('should verify message and get address', async () => {
    const verified = await sdk.verifyMessage(testData.publicKey, testData.message, testData.signature);
    expect(verified).toBe(true);

    const actualAddress = await sdk.getAddress(testData.publicKey);
    expect(actualAddress).toBe(testData.address);
  });

  test('should throw error if data invalid', async () => {
    await expect(sdk.verifyMessage('0xpublic', testData.message, testData.signature)).rejects.toThrow();
    await expect(sdk.verifyMessage(testData.publicKey, testData.message, '11111')).rejects.toThrow();
    await expect(sdk.verifyMessage(testData.publicKey, 'xxxx', testData.signature)).resolves.toBe(false);
  });
});
