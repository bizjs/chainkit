import { describe, expect, test } from 'vitest';
import { verifyMessage } from '../src';

describe('solana-chain', () => {
  const testData = {
    message: 'Welcome to EthSign',
    publicKey: '6Akozr9epukDjDdgTqz1npeEVCC2KVUywDDzEw7ate4',
    signature: '4KAxMirt5LNzc2XnQmZDb1qH9mtrTCgmKRVSmMiioqnswpNZosPSPM7dRspALZeRYa8Vr9iAykZ4ebD4gB66TvK4',
    address: '6Akozr9epukDjDdgTqz1npeEVCC2KVUywDDzEw7ate4',
  };

  test('should verify message and get address', async () => {
    const verified = await verifyMessage(testData.publicKey, testData.message, testData.signature);
    expect(verified).toBe(true);

    expect(testData.publicKey).toBe(testData.address);
  });

  test('should throw error if data invalid', async () => {
    await expect(verifyMessage('0xpublic', testData.message, testData.signature)).rejects.toThrow();
    await expect(verifyMessage(testData.publicKey, testData.message, '11111')).rejects.toThrow();
    await expect(verifyMessage(testData.publicKey, 'xxxx', testData.signature)).resolves.toBe(false);
  });
});
