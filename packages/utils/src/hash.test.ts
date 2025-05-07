import { createHash } from 'node:crypto';
import { describe, expect, test } from 'vitest';

import { hashSha256 } from './hash';

function sha256InNode(text: string): string {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

describe('Hashing', () => {
  test('sha256', () => {
    for (let i = 0; i < 5; i++) {
      const text = 'Hello, world!' + i;
      const hash = sha256InNode(text);

      const hash2 = hashSha256(text);

      expect(hash).toEqual(hash2);
    }
  });
});
