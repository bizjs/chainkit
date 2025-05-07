import { describe, expect, test } from 'vitest';
import {
  getAddressWithWalletVersion,
  getWalletVersion,
  TVMWalletVersion,
  verifyMessage,
  verifyTonConnectMessage,
} from '../src';

describe('tvm-chain', () => {
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
    v4r2Address: 'UQANAsrLyyHoq8N4EZ-QfADXhtoSUybdSKXOknMLWLbA7rt7',
  };

  test('should verify message and get address', async () => {
    const verified = await verifyMessage(
      testDataForWalletV4.publicKey,
      testDataForWalletV4.message,
      testDataForWalletV4.signature,
    );
    expect(verified).toBe(true);

    const walletVersion = getWalletVersion(testDataForWalletV4.publicKey, testDataForWalletV4.address);
    expect(walletVersion).toBe(TVMWalletVersion.V4);

    const actualAddress = getAddressWithWalletVersion(testDataForWalletV4.publicKey, walletVersion);

    expect(actualAddress.toString()).toBe(testDataForWalletV4.address);
  });

  test('should throw error if data invalid', async () => {
    expect(() => verifyMessage('0xpublic', testDataForWalletV4.message, testDataForWalletV4.signature)).toThrow();
    expect(() => verifyMessage(testDataForWalletV4.publicKey, testDataForWalletV4.message, '11111')).toThrow();
    expect(verifyMessage(testDataForWalletV4.publicKey, 'xxxx', testDataForWalletV4.signature)).toBe(false);
  });

  test('should verify ton connect message and get address', async () => {
    const verified = await verifyTonConnectMessage(
      testDataForTonConnect.publicKey,
      testDataForTonConnect.message,
      testDataForTonConnect.signature,
      testDataForTonConnect.v4r2Address,
    );
    expect(verified).toBe(true);

    const walletVersion = getWalletVersion(testDataForTonConnect.publicKey, testDataForTonConnect.address);
    expect(walletVersion).toBe(TVMWalletVersion.V5R1);

    const actualAddress = getAddressWithWalletVersion(testDataForTonConnect.publicKey, walletVersion);
    expect(actualAddress.toString({ testOnly: true, bounceable: false })).toBe(testDataForTonConnect.address);
  });

  test('should throw error when pass invalid wallet version', async () => {
    expect(() => getWalletVersion(testDataForTonConnect.publicKey, testDataForWalletV4.address)).toThrow(
      'Given address does not match any wallet contrac',
    );
    expect(() => getAddressWithWalletVersion(testDataForTonConnect.publicKey, 'V3' as any)).toThrowError();
  });
});
