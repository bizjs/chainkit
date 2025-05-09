import { sha256 } from '@noble/hashes/sha2';
import { utf8ToBytes } from '@noble/hashes/utils';
import { Buffer } from 'buffer';

export function hashSha256(text: string): string {
  const hash = sha256(utf8ToBytes(text));
  const hex = Buffer.from(hash).toString('hex');
  return hex;
}
