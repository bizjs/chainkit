import { COSESign1, COSEKey, BigNum, Label, Int } from '@emurgo/cardano-message-signing-nodejs';
import {
  Ed25519Signature,
  PublicKey,
  Address,
  EnterpriseAddress,
  NetworkInfo,
  Credential,
} from '@emurgo/cardano-serialization-lib-nodejs';

export class CardanoChain {
  /**
   * Verify message with signature
   * https://developers.cardano.org/docs/integrate-cardano/user-wallet-authentication#back-end
   * @param key
   * @param message
   * @param signature
   * @returns
   */
  async verifyMessage(key: string, message: string, signature: string): Promise<boolean> {
    const decoded = COSESign1.from_bytes(Buffer.from(signature, 'hex'));

    // verify message match
    const payload = decoded.payload();
    const actualMessageHex = Buffer.from(payload).toString('hex');
    const expectMessageHex = this._message2Hex(message);
    const messageMatch = actualMessageHex === expectMessageHex;

    if (messageMatch === false) {
      return false;
    }

    // calculate public key from key
    const keyBytes = COSEKey.from_bytes(Buffer.from(key, 'hex'));
    const pubKeyBytes = keyBytes.header(Label.new_int(Int.new_negative(BigNum.from_str('2')))).as_bytes();
    const publicKey = PublicKey.from_bytes(pubKeyBytes);

    // verify signature
    const sig = Ed25519Signature.from_bytes(decoded.signature());
    const receivedData = decoded.signed_data().to_bytes();
    const isVerified = publicKey.verify(receivedData, sig);

    return isVerified && messageMatch;
  }

  private _message2Hex(message: string) {
    let messageHex = '';
    for (let i = 0, l = message.length; i < l; i++) {
      const charHex = message.charCodeAt(i).toString(16);
      messageHex += charHex;
    }
    return messageHex;
  }

  async getStakeAddress(signature: string): Promise<string> {
    const decoded = COSESign1.from_bytes(Buffer.from(signature, 'hex'));
    // get address from header
    const headermap = decoded.headers().protected().deserialized_headers();
    const addressHex = Buffer.from(headermap.header(Label.new_text('address')).to_bytes())
      .toString('hex')
      .substring(4);
    const addr = Address.from_bytes(Buffer.from(addressHex, 'hex'));

    return addr.to_bech32();
  }

  async getAddress(key: string, addressFormat: 'mainnet' | 'testnet' = 'mainnet'): Promise<string> {
    const keyBytes = COSEKey.from_bytes(Buffer.from(key, 'hex'));
    const pubKeyBytes = keyBytes.header(Label.new_int(Int.new_negative(BigNum.from_str('2')))).as_bytes();

    const pubKey = PublicKey.from_bytes(pubKeyBytes);
    let enterpriseAddress: EnterpriseAddress;
    if (addressFormat === 'mainnet') {
      enterpriseAddress = EnterpriseAddress.new(
        NetworkInfo.mainnet().network_id(),
        Credential.from_keyhash(pubKey.hash()),
      );
    } else if (addressFormat === 'testnet') {
      enterpriseAddress = EnterpriseAddress.new(
        NetworkInfo.testnet_preprod().network_id(),
        Credential.from_keyhash(pubKey.hash()),
      );
    } else {
      throw new Error('Invalid address format');
    }

    return enterpriseAddress.to_address().to_bech32();
  }
}
