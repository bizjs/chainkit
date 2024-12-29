import { COSESign1, COSEKey, BigNum, Label, Int } from '@emurgo/cardano-message-signing-nodejs';
import { Ed25519Signature, PublicKey, Address } from '@emurgo/cardano-serialization-lib-nodejs';

export class CardanoChain {
  async verifyMessage(key: string, message: string, signature: string): Promise<boolean> {
    const decoded = COSESign1.from_bytes(Buffer.from(signature, 'hex'));

    // verify message match
    const payload = decoded.payload();
    const actualMessageHex = Buffer.from(payload).toString('hex');
    const expectMessageHex = this.message2Hex(message);
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

  private message2Hex(message: string) {
    let messageHex = '';
    for (let i = 0, l = message.length; i < l; i++) {
      const charHex = message.charCodeAt(i).toString(16);
      messageHex += charHex;
    }
    return messageHex;
  }

  async getBech32Address(publicKey: string): Promise<string> {
    const decoded = COSESign1.from_bytes(Buffer.from(publicKey, 'hex'));
    // get address from header
    const headermap = decoded.headers().protected().deserialized_headers();
    const addressHex = Buffer.from(headermap.header(Label.new_text('address')).to_bytes())
      .toString('hex')
      .substring(4);
    const addr = Address.from_bytes(Buffer.from(addressHex, 'hex'));

    return addr.to_bech32();
  }
}
