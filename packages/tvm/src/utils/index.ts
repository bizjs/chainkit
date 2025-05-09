import nacl from 'tweetnacl';
import { Address, WalletContractV3R1, WalletContractV3R2, WalletContractV4, WalletContractV5R1 } from '@ton/ton';
import { TVMWalletVersion } from '../constants';
import { _buildFullMessageForTonConnect, _tryGetTonWallet } from './_internal';

const naclVerify = nacl.sign.detached.verify;

export function verifyMessage(publicKey: string, message: string, signature: string): boolean {
  const finalMessage = Buffer.concat([
    Buffer.from([0xff, 0xff]),
    Buffer.from('ton-safe-sign-magic'),
    Buffer.from(message, 'utf8'),
  ]).toString('hex');

  return naclVerify(Buffer.from(finalMessage, 'hex'), Buffer.from(signature, 'hex'), Buffer.from(publicKey, 'hex'));
}

/**
 * Verify TonConnect signature
 * @param publicKey
 * @param message
 * @param signature
 * @param address
 * @returns
 */
export async function verifyTonConnectMessage(
  publicKey: string,
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');

  const wallet = _tryGetTonWallet(publicKeyBuffer, address);

  const fullMessageBuffer = _buildFullMessageForTonConnect(wallet.address, JSON.parse(message));

  const sig = Buffer.from(signature, 'base64');

  return naclVerify(fullMessageBuffer, sig, publicKeyBuffer);
}

/**
 * Get TVM address from public key and wallet version
 * @param publicKey
 * @param walletVersion
 * @returns
 */
export function getAddressWithWalletVersion(publicKey: string, walletVersion: TVMWalletVersion): Address {
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');

  let wallet: WalletContractV4 | WalletContractV5R1 | WalletContractV3R2 | WalletContractV3R1;
  if (walletVersion === TVMWalletVersion.V4) {
    wallet = WalletContractV4.create({ publicKey: publicKeyBuffer, workchain: 0 });
  } else if (walletVersion === TVMWalletVersion.V5R1) {
    wallet = WalletContractV5R1.create({ publicKey: publicKeyBuffer, workchain: 0 });
  } else if (walletVersion === TVMWalletVersion.V3R2) {
    wallet = WalletContractV3R2.create({ publicKey: publicKeyBuffer, workchain: 0 });
  } else if (walletVersion === TVMWalletVersion.V3R1) {
    wallet = WalletContractV3R1.create({ publicKey: publicKeyBuffer, workchain: 0 });
  } else {
    throw new Error('Invalid wallet version');
  }
  return wallet.address;
}

/**
 * Get wallet version from public key and address
 * @param publicKey
 * @param address
 * @returns
 */
export function getWalletVersion(publicKey: string, address: string): TVMWalletVersion {
  const wallet = _tryGetTonWallet(Buffer.from(publicKey, 'hex'), address);
  if (wallet instanceof WalletContractV4) {
    return TVMWalletVersion.V4;
  } else if (wallet instanceof WalletContractV5R1) {
    return TVMWalletVersion.V5R1;
  } else if (wallet instanceof WalletContractV3R1) {
    return TVMWalletVersion.V3R1;
  } else if (wallet instanceof WalletContractV3R2) {
    return TVMWalletVersion.V3R2;
  }
  throw new Error('Invalid wallet version');
}
