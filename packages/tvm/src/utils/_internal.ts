import { Address, WalletContractV3R1, WalletContractV3R2, WalletContractV4, WalletContractV5R1 } from '@ton/ton';
import { createHash } from 'node:crypto';

/**
 * Build full message to verify, https://gist.github.com/TrueCarry/cac00bfae051f7028085aa018c2a05c6
 * @param addressHash
 * @param workChain
 * @param message
 * @returns
 */
export function _buildFullMessageForTonConnect(
  addr: Address,
  message: {
    timestamp: number;
    payload: string;
    domain: {
      lengthBytes: number;
      value: string;
    };
  },
): Buffer {
  const tonProofPrefix = 'ton-proof-item-v2/';
  const tonConnectPrefix = 'ton-connect';

  const wc = Buffer.alloc(4);
  wc.writeUint32BE(addr.workChain);

  const ts = Buffer.alloc(8);
  ts.writeBigUint64LE(BigInt(message.timestamp));

  const dl = Buffer.alloc(4);
  dl.writeUint32LE(message.domain.lengthBytes);

  const m = Buffer.concat([
    Buffer.from(tonProofPrefix),
    wc,
    addr.hash,
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

export function _tryGetTonWallet(
  publicKey: Buffer,
  address: string | Address,
): WalletContractV4 | WalletContractV5R1 | WalletContractV3R2 | WalletContractV3R1 {
  const targetAddress = Address.isAddress(address) ? address : Address.parse(address);
  for (const WalletContract of [WalletContractV4, WalletContractV5R1, WalletContractV3R2, WalletContractV3R1]) {
    const w = WalletContract.create({ publicKey, workchain: 0 });
    if (w.address.equals(targetAddress)) {
      return w;
    }
  }
  throw new Error('Given address does not match any wallet contract');
}
