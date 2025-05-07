export function _getPublicKeyBuffer(publicKey: string): Buffer {
  const key = publicKey.slice(2, 66);
  return Buffer.from(key, 'hex');
}
