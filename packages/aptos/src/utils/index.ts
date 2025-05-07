import { Account, Ed25519PublicKey } from '@aptos-labs/ts-sdk';
import { naclVerify } from '@bizjs/chainkit-utils';
import { Buffer } from 'buffer';
import { _getPublicKeyBuffer } from './_internal';

/**
 * Verify message with public key and signature
 * @param publicKey public key, not address
 * @param message
 * @param signature
 * @returns
 */
export function verifyMessage(publicKey: string, message: string, signature: string): boolean {
  return naclVerify(Buffer.from(message), Buffer.from(signature, 'hex'), _getPublicKeyBuffer(publicKey));
}

/**
 * Get derived address from public key
 * @param publicKey
 * @returns
 */
export function getDerivedAddress(publicKey: string): string {
  // old implementation using 'aptos' package
  // const uint8Key = HexString.ensure(publicKey).toUint8Array();
  // const ed25519PubKey = new TxnBuilderTypes.Ed25519PublicKey(uint8Key);
  // const authenticationKey = TxnBuilderTypes.AuthenticationKey.fromEd25519PublicKey(ed25519PubKey);
  // return authenticationKey.derivedAddress().hex();
  const pubKey = new Ed25519PublicKey(_getPublicKeyBuffer(publicKey));
  return Account.authKey({ publicKey: pubKey }).derivedAddress().bcsToHex().toString();
}
