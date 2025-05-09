export function _getPublicKeyBuffer(publicKey: string): Buffer {
  const key = publicKey.indexOf('0x') === 0 ? publicKey.slice(2, 66) : publicKey;
  return Buffer.from(key, 'hex');
}
