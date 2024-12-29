import { ChainSdkFactory, ChainType, TVMChain, TVMWalletVersion } from '../src';

describe('tvm-chain', () => {
  let sdk: TVMChain;

  beforeEach(() => {
    sdk = ChainSdkFactory.getChainSdk(ChainType.TVM);
  });

  const testDataForWalletV4 = {
    message: 'Welcome to EthSign',
    publicKey: 'f87bcf992f0a4a106a07226e0178148fcc5dff4b68d1829453c50a7f209c0e87',
    signature:
      '5ea32f89124362f44f766777e4181f3ad00c277615c0b606609aeb484d300c805a253ba32808959d1c47afeae1c1df4b6abf76b0b0188271957dba0ea94c1705',
    address: 'EQBvuTREOWQ6mamUs1c-PVuV27JEvMPYQB91o8UoHqAiCr79',
  };

  const testDataForTonConnect = {
    signature: 'wXeIoAxkj3BjkL9zinn0htl8CMK8IhsL5sNlcUZex9hBBTT+/8tfrY0BVKVZSfusE/cNiuwHXtBBQ9Lbq/8rBQ==',
    message:
      '{"timestamp":1719556142,"payload":"4078680b0cb1dc86d144945c71a73641fc36eab3fbfe9713d556e8f4f3097729","domain":{"lengthBytes":14,"value":"localhost:5173"}}',
    publicKey: 'a59a97021ec0bb7609ac9e3959306fc410a6424693307eb6cceb5b339484493f',
    // testOnly: true, bounceable: false
    address: '0QCWOLP0jya2vOKLzJN7lnykFs6FkkS8yDYnsZLa9CIepYrs',
  };

  test('should verify message and get address', async () => {
    const verified = await sdk.verifyMessage(
      testDataForWalletV4.publicKey,
      testDataForWalletV4.message,
      testDataForWalletV4.signature,
    );
    expect(verified).toBe(true);

    const walletVersion = sdk.getWalletVersion(testDataForWalletV4.publicKey, testDataForWalletV4.address);
    expect(walletVersion).toBe(TVMWalletVersion.V4);

    const actualAddress = await sdk.getAddress(testDataForWalletV4.publicKey, walletVersion);

    expect(actualAddress.toString()).toBe(testDataForWalletV4.address);
  });

  test('should throw error if data invalid', async () => {
    await expect(
      sdk.verifyMessage('0xpublic', testDataForWalletV4.message, testDataForWalletV4.signature),
    ).rejects.toThrow();
    await expect(
      sdk.verifyMessage(testDataForWalletV4.publicKey, testDataForWalletV4.message, '11111'),
    ).rejects.toThrow();
    await expect(sdk.verifyMessage(testDataForWalletV4.publicKey, 'xxxx', testDataForWalletV4.signature)).resolves.toBe(
      false,
    );
  });

  test('should verify ton connect message and get address', async () => {
    const verified = await sdk.verifyTonConnectMessage(
      testDataForTonConnect.publicKey,
      testDataForTonConnect.message,
      testDataForTonConnect.signature,
      '',
    );
    expect(verified).toBe(true);

    const walletVersion = sdk.getWalletVersion(testDataForTonConnect.publicKey, testDataForTonConnect.address);
    expect(walletVersion).toBe(TVMWalletVersion.V5R1);

    const actualAddress = await sdk.getAddress(testDataForTonConnect.publicKey, walletVersion);
    expect(actualAddress.toString({ testOnly: true, bounceable: false })).toBe(testDataForTonConnect.address);
  });

  test('should throw error when pass invalid wallet version', async () => {
    expect(() => sdk.getWalletVersion(testDataForTonConnect.publicKey, testDataForWalletV4.address)).toThrow(
      'Invalid wallet version',
    );
    await expect(sdk.getAddress(testDataForTonConnect.publicKey, 'V3' as any)).rejects.toThrow();
  });
});
