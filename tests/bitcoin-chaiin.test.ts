import { BitcoinChain, ChainSdkFactory, ChainType } from '../src';

describe('bitcoin-chain', () => {
  let sdk: BitcoinChain;
  beforeEach(() => {
    sdk = ChainSdkFactory.getChainSdk(ChainType.Bitcoin);
  });

  const testDataForBip322 = {
    message:
      '{\n  "statement": "Welcome to EthSign",\n  "chainId": "",\n  "address": "bc1qqwz92srtn5fvprtcdcj2myrq2wegf0r8h5rdh8",\n  "issuedAt": "1689299676446",\n  "domain": "localhost",\n  "version": "1",\n  "nonce": "ko5pq-4mrYVkAb4QbdDnO"\n}',
    publicKey: '024847a027df62344df48bff8ff1fb1c48c153263ae3517ac1b19f352223b24e88',
    signature:
      'AkcwRAIgdn9UYUPU/8mUovNnlrQDgdYh+4l7cIDVf/UoDkSea1ACIDeXbhaV28VWadikFYr0VKS/8GAFvSa4ul+2XYJSuVPQASECSEegJ99iNE30i/+P8fscSMFTJjrjUXrBsZ81IiOyTog=',
    nativeAddress: 'bc1qqwz92srtn5fvprtcdcj2myrq2wegf0r8h5rdh8',
    taprootAddress: 'bc1pc9nm2astdy36s3n6pf2q0247wlwr8jcm3gk8z4sn32c7vwjaqkzqnh52yy',
  };

  test('should verify bip322 message and get address', async () => {
    const verified = await sdk.verifyBIP322Message(
      testDataForBip322.publicKey,
      testDataForBip322.message,
      testDataForBip322.signature,
    );
    expect(verified).toBe(true);

    let actualAddress = await sdk.getAddress(testDataForBip322.publicKey, 'segwit_native');
    expect(actualAddress).toBe(testDataForBip322.nativeAddress);

    actualAddress = await sdk.getAddress(testDataForBip322.publicKey, 'segwit_taproot');
    expect(actualAddress).toBe(testDataForBip322.taprootAddress);

    actualAddress = sdk.getNativeAddress(testDataForBip322.publicKey);
    expect(actualAddress).toBe(testDataForBip322.nativeAddress);
  });

  test('should throw error when get address with invalid address type', async () => {
    await expect(sdk.getAddress(testDataForBip322.publicKey, 'invalid' as any)).rejects.toThrow('Invalid addressType');
  });
});
