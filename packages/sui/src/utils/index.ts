import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { _getEd25519PublicKey, _getPublicKeyBuffer } from './_internal';

/**
 * Verify message with public key and signature
 * @param publicKey public key, not address, hex format
 * @param message
 * @param signature
 * @returns
 */
export async function verifyMessage(publicKeyHex: string, message: string, signatureBase64: string): Promise<boolean> {
  const expectAddress = getDerivedAddress(publicKeyHex);
  const pk = await verifyPersonalMessageSignature(new Uint8Array(Buffer.from(message, 'utf8')), signatureBase64, {
    address: expectAddress,
  });
  return pk.verifyAddress(expectAddress);
}

export async function verifyMessageWithAddress(
  address: string,
  message: string,
  signatureBase64: string,
): Promise<boolean> {
  const pk = await verifyPersonalMessageSignature(new Uint8Array(Buffer.from(message, 'utf8')), signatureBase64, {
    address,
  });
  return pk.verifyAddress(address);
}

/**
 * Get derived address from public key
 * @param publicKey
 * @returns
 */
export function getDerivedAddress(publicKey: string): string {
  const pubKey = _getEd25519PublicKey(publicKey);
  return pubKey.toSuiAddress();
}
