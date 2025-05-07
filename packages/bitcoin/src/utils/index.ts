import * as bitcoinjsLib from 'bitcoinjs-lib';
import { message as messageUtil } from '@unisat/wallet-sdk';
import { BtcWallet, BITCOIN_MESSAGE_ECDSA } from '@okxweb3/coin-bitcoin';
import { _initBitconjsLibAndEccLib, _verifyBip322 } from './_internal';

export async function verifyUnisatMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
  return messageUtil.verifyMessageOfECDSA(publicKey, message, signature);
}

export async function verifyEcdsaMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
  const wallet = new BtcWallet();
  const verified = await wallet.verifyMessage({
    signature,
    data: {
      message,
      publicKey,
      type: BITCOIN_MESSAGE_ECDSA,
    },
  });
  return verified;
}

/**
 * verify BIP322 message(for leather wallet)
 * @param publicKey
 * @param message
 * @param signature
 * @returns
 */
export async function verifyBIP322Message(publicKey: string, message: string, signature: string): Promise<boolean> {
  const initialed = _initBitconjsLibAndEccLib();
  // see link: https://github.com/bitcoinjs/bitcoinjs-lib/issues/1918
  const verified = _verifyBip322(initialed.ecpair, message, publicKey, signature);
  return verified;
}

/**
 * Get friendly address from publicKey or address
 * @param publicKey
 * @param options
 * @param options.addressType The address type, can use segwit_taproot(bc1p), segwit_native(bc1q)
 * @returns
 */
export function getAddress(
  publicKey: string,
  addressType: 'segwit_taproot' | 'segwit_native' = 'segwit_taproot',
): Promise<string> {
  const wallet = new BtcWallet();
  if (addressType === 'segwit_taproot') {
    return wallet.getAddressByPublicKey({
      publicKey,
      addressType: 'segwit_taproot',
    });
  } else if (addressType === 'segwit_native') {
    return wallet.getAddressByPublicKey({
      publicKey,
      addressType: 'segwit_native',
    });
  }
  throw new Error('Invalid addressType');
}

/**
 * Get native address from publicKey, will return bc1q address
 * @param publicKey
 * @returns
 */
export function getNativeAddress(publicKey: string): string {
  const { payments } = bitcoinjsLib;
  const p = payments.p2wpkh({
    pubkey: Buffer.from(publicKey, 'hex'),
  });
  const segwitAddress = p.address;

  // Will return bc1q address, see link: http://aandds.com/blog/bitcoin-key-addr.html#a0c40a52
  return segwitAddress!;
}
