import { Account, Ed25519PublicKey } from '@aptos-labs/ts-sdk';

import { naclSignDetachedVerify } from '../utils';

export class AptosChain {
  /**
   * Verify message with public key and signature
   * @param publicKey public key, not address
   * @param message
   * @param signature
   * @returns
   */
  async verifyMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
    return naclSignDetachedVerify(
      Buffer.from(message),
      Buffer.from(signature, 'hex'),
      this._getPublicKeyBuffer(publicKey),
    );
  }

  private _getPublicKeyBuffer(publicKey: string): Buffer {
    const key = publicKey.slice(2, 66);
    return Buffer.from(key, 'hex');
  }

  async getDerivedAddress(publicKey: string): Promise<string> {
    // old implementation using 'aptos' package
    // const uint8Key = HexString.ensure(publicKey).toUint8Array();
    // const ed25519PubKey = new TxnBuilderTypes.Ed25519PublicKey(uint8Key);
    // const authenticationKey = TxnBuilderTypes.AuthenticationKey.fromEd25519PublicKey(ed25519PubKey);
    // return authenticationKey.derivedAddress().hex();
    const pubKey = new Ed25519PublicKey(this._getPublicKeyBuffer(publicKey));
    return Account.authKey({ publicKey: pubKey }).derivedAddress().bcsToHex().toString();
  }
}
