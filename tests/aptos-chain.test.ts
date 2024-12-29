import { AptosChain, ChainSdkFactory, ChainType } from '../src';
describe('aptos-chain', () => {
  let sdk: AptosChain;

  const testData = {
    message: 'APTOS\nmessage: Welcome to EthSign\nnonce: 1689144313707',
    publicKey: '0x708dd8a25e7b70ef50091637dfb19d1ef2517b83f491e892e14033ac5d645c73',
    signature:
      '123791f4ea82fed4dad0df716736da9c11a65051d3183b6d85d6b893c0da9087cb96a5ceb5b8b59ffbf4af0067e0c915a94ae4efd5876edf9b537fb60820020e',
    address: '0x6b1c036aa3bcb0a58b79a07c6d161f703bb2c8e14c78cbde2fcf06e954d632fa',
  };

  beforeEach(() => {
    sdk = ChainSdkFactory.getChainSdk(ChainType.Aptos) as AptosChain;
  });

  test('should verify message and get derived address', async () => {
    const verified = await sdk.verifyMessage(testData.publicKey, testData.message, testData.signature);
    expect(verified).toBe(true);

    const actualAddress = await sdk.getDerivedAddress(testData.publicKey);
    expect(actualAddress).toBe(testData.address);
  });

  test('should throw error if data invalid', async () => {
    await expect(sdk.verifyMessage('0xpublic', testData.message, testData.signature)).rejects.toThrow(
      'bad public key size',
    );
    await expect(sdk.verifyMessage(testData.publicKey, testData.message, '11111')).rejects.toThrow(
      'bad signature size',
    );
    await expect(sdk.verifyMessage(testData.publicKey, 'xxxx', testData.signature)).resolves.toBe(false);
  });
});
