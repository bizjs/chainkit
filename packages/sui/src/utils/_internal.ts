import { Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';

export function _getPublicKeyBuffer(publicKey: string): Buffer {
  const hasPrefix = publicKey.startsWith('0x') || publicKey.startsWith('00');
  const key = hasPrefix ? publicKey.slice(2, 66) : publicKey;
  return Buffer.from(key, 'hex');
}

export function _getEd25519PublicKey(publicKey: string): Ed25519PublicKey {
  const pubKey = new Ed25519PublicKey(_getPublicKeyBuffer(publicKey));
  return pubKey;
}
