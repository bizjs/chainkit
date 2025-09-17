import { describe, expect, test } from 'vitest';
import { verifyMessage } from '../src';
describe('cosmos-chain', () => {
  const testData = {
    address: 'cosmos12se5we4rp3ltn9elrkngyhrp7nvg659pfyz9n8',
    message: 'Hello Cosmos!',
    signature: {
      pub_key: {
        type: 'tendermint/PubKeySecp256k1',
        value: 'A0PqgWmKt/wpPlSExXI6va9ITDxd1Mtel/0VFBAusdwu',
      },
      signature: 'Ulr7zqnuhD4UQeaQkMLHZYY1Q9MRbnngW50iuacyO9wkg9g8XuKr4I1gzShJwopedgGvE4xLvqzIUytrvBsSLg==',
    },
    chainId: 'cosmoshub-4',
  };

  test('should verify message', () => {
    const verified = verifyMessage(
      testData.signature.pub_key.value,
      testData.message,
      testData.signature.signature,
      testData.address,
    );
    expect(verified).toBe(true);
  });

  test('should verify message failed', () => {
    expect(() => {
      verifyMessage(
        'testData.signature.pub_key.value',
        btoa('Hello Cosmos!'),
        testData.signature.signature,
        testData.address,
      );
    }).toThrowError('Invalid base64 string format');
  });
});
