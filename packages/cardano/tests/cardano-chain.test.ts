import { describe, expect, test } from 'vitest';
import { getAddress, getStakeAddress, verifyMessage } from '../src';

describe('cardano-chain', () => {
  const testData = {
    message:
      '{\n  "statement": "Welcome to EthSign",\n  "issuedAt": "2023-12-06T08:27:49.990Z",\n  "domain": "localhost:3001",\n  "uri": "http://localhost:3001",\n  "nonce": "xmjx2jkyjl"\n}',
    publicKey: 'a401010327200621582019d9d5fc5b4c1476ff508efd6ca406b41c1bea8ce10d0187206022d85fdb36e2',
    signature:
      '84582aa201276761646472657373581de18902cc7663251e738ba2d61f0e86865d3bce33866f3e3f9e9359beb8a166686173686564f458a77ba20202273746174656d656e74223a202257656c636f6d6520746f204574685369676e222ca2020226973737565644174223a2022323032332d31322d30365430383a32373a34392e3939305a222ca202022646f6d61696e223a20226c6f63616c686f73743a33303031222ca202022757269223a2022687474703a2f2f6c6f63616c686f73743a33303031222ca2020226e6f6e6365223a2022786d6a78326a6b796a6c22a7d5840a8f1f1a6bf4f241cffe05c19c51b2e1e4c50143c802d309a2f243b50c4298fa0975e2c929e623eff934f58e4c23006a1f3c05306cbb4e85ae2009771ea43090e',
    address: 'addr1vxys9nrkvvj3uuut5ttp7r5xsewnhn3nsehnu0u7jdvmawq93aszy',
    stakeAddress: 'stake1uxys9nrkvvj3uuut5ttp7r5xsewnhn3nsehnu0u7jdvmawqemak7k',
    testnetAddress: 'addr_test1vzys9nrkvvj3uuut5ttp7r5xsewnhn3nsehnu0u7jdvmawq7efvdp',
  };

  test('should verify message and get address', () => {
    const verified = verifyMessage(testData.publicKey, testData.message, testData.signature);
    expect(verified).toBe(true);

    const actualAddress = getAddress(testData.publicKey);
    expect(actualAddress).toBe(testData.address);

    const actualTestnetAddress = getAddress(testData.publicKey, 'testnet');
    expect(actualTestnetAddress).toBe(testData.testnetAddress);

    const actualStakeAddress = getStakeAddress(testData.signature);
    expect(actualStakeAddress).toBe(testData.stakeAddress);
  });

  test('should throw error if address format invalid', () => {
    expect(() => getAddress(testData.publicKey, 'xxxx' as any)).toThrow();
  });

  test('should throw error if data invalid', () => {
    expect(() => verifyMessage('0xpublic', testData.message, testData.signature)).toThrow();
    expect(() => verifyMessage(testData.publicKey, testData.message, '11111')).toThrow();
    expect(verifyMessage(testData.publicKey, 'xxxx', testData.signature)).toBe(false);
  });
});
