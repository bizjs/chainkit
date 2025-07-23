import { describe, expect, test } from 'vitest';
import { verifyMessage, verifyOffchainMessage } from '../src';

describe('solana-chain', () => {
  const testData = {
    message: 'Welcome to EthSign',
    publicKey: '6Akozr9epukDjDdgTqz1npeEVCC2KVUywDDzEw7ate4',
    signature: '4KAxMirt5LNzc2XnQmZDb1qH9mtrTCgmKRVSmMiioqnswpNZosPSPM7dRspALZeRYa8Vr9iAykZ4ebD4gB66TvK4',
    address: '6Akozr9epukDjDdgTqz1npeEVCC2KVUywDDzEw7ate4',
  };
  const testDataOffchain = {
    message:
      'T99JCTWEnhwZvvtaS8WkmA7iyBotznySWhWd8AT9XnT73jkpmGqdvhfq96LcAbTRKFFY9q9m6wb3iRYU67PJ3DNUjccqBEVDBS2E1RR9K2tDcAUxc1PhAiioNRDBgqz8Ypb6J6MCZLS2MKk1hVyjj1di48BRurf9daq9bQWP8iJyxZC',
    publicKey: 'DHkShujkB7N3WVpCeQqy8iRLVxRdv1uAUTpceMmjmrP2',
    signature: '49z2hL5zMQzzkFtaRspE1JhhvxBE5rrx62JbWx7nkCpMoMVHQm25xExsDYR65htmuqtwBxsygcYc1WEooQw8DvHY',
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

  test('should verify offchain message', async () => {
    const verified = await verifyOffchainMessage(
      testDataOffchain.publicKey,
      testDataOffchain.message,
      testDataOffchain.signature,
    );
    expect(verified).toBe(true);
  });
});
