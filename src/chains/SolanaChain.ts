import bs58 from 'bs58';

import { naclSignDetachedVerify } from '../utils';

export class SolanaChain {
  async verifyMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
    const sig = Buffer.from(bs58.decode(signature));
    return naclSignDetachedVerify(Buffer.from(message), sig, Buffer.from(bs58.decode(publicKey)));
  }

  async getAddress(publicKey: string): Promise<string> {
    return publicKey;
  }
}
