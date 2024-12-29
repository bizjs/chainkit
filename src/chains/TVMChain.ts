import { createHash } from 'node:crypto';
import { Address, WalletContractV4, WalletContractV5R1 } from '@ton/ton';

import { naclSignDetachedVerify } from '../utils';

export enum TVMWalletVersion {
  V4 = 'V4',
  V5R1 = 'V5R1',
}

export class TVMChain {
  async verifyMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
    const finalMessage = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from('ton-safe-sign-magic'),
      Buffer.from(message, 'utf8'),
    ]).toString('hex');

    return naclSignDetachedVerify(
      Buffer.from(finalMessage, 'hex'),
      Buffer.from(signature, 'hex'),
      Buffer.from(publicKey, 'hex'),
    );
  }

  async verifyTonConnectMessage(
    publicKey: string,
    message: string,
    signature: string,
    address: string,
  ): Promise<boolean> {
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');

    const wallet = this._tryGetTonWallet(publicKeyBuffer, address);

    const fullMessageBuffer = this.buildFullMessageForTonConnect(wallet, JSON.parse(message), address);

    const sig = Buffer.from(signature, 'base64');

    return naclSignDetachedVerify(fullMessageBuffer, sig, publicKeyBuffer);
  }

  /**
   * Build full message to verify, https://gist.github.com/TrueCarry/cac00bfae051f7028085aa018c2a05c6
   * @param addressHash
   * @param workChain
   * @param message
   * @returns
   */
  private buildFullMessageForTonConnect(
    wallet: WalletContractV4 | WalletContractV5R1,
    message: {
      timestamp: number;
      payload: string;
      domain: {
        lengthBytes: number;
        value: string;
      };
    },
    address: string,
  ): Buffer {
    const tonProofPrefix = 'ton-proof-item-v2/';
    const tonConnectPrefix = 'ton-connect';

    const wc = Buffer.alloc(4);
    wc.writeUint32BE(wallet.address.workChain);

    const ts = Buffer.alloc(8);
    ts.writeBigUint64LE(BigInt(message.timestamp));

    const dl = Buffer.alloc(4);
    dl.writeUint32LE(message.domain.lengthBytes);

    const m = Buffer.concat([
      Buffer.from(tonProofPrefix),
      wc,
      wallet.address.hash,
      dl,
      Buffer.from(message.domain.value),
      ts,
      Buffer.from(message.payload),
    ]);

    const messageHash = createHash('sha256').update(m).digest();

    const fullMes = Buffer.concat([Buffer.from([0xff, 0xff]), Buffer.from(tonConnectPrefix), Buffer.from(messageHash)]);

    const res = createHash('sha256').update(fullMes).digest();
    return Buffer.from(res);
  }

  private _tryGetTonWallet(publicKey: Buffer, address: string): WalletContractV4 | WalletContractV5R1 {
    // 默认走 V4
    if (!address) {
      return WalletContractV4.create({ publicKey, workchain: 0 });
    }
    const rawAddress = Address.parse(address).toRawString();
    for (const WalletContract of [WalletContractV4, WalletContractV5R1]) {
      const w = WalletContract.create({ publicKey, workchain: 0 });
      if (w.address.toRawString() === rawAddress) {
        return w;
      }
    }
  }

  getWalletVersion(publicKey: string, address: string): TVMWalletVersion {
    const wallet = this._tryGetTonWallet(Buffer.from(publicKey, 'hex'), address);
    if (wallet instanceof WalletContractV4) {
      return TVMWalletVersion.V4;
    } else if (wallet instanceof WalletContractV5R1) {
      return TVMWalletVersion.V5R1;
    }
    throw new Error('Invalid wallet version');
  }

  async getAddress(publicKey: string, walletVersion: TVMWalletVersion): Promise<Address> {
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    let wallet: WalletContractV4 | WalletContractV5R1;
    if (walletVersion === 'V4') {
      wallet = WalletContractV4.create({ publicKey: publicKeyBuffer, workchain: 0 });
    } else if (walletVersion === 'V5R1') {
      wallet = WalletContractV5R1.create({ publicKey: publicKeyBuffer, workchain: 0 });
    } else {
      throw new Error('Invalid wallet version');
    }
    return wallet.address;
  }
}
