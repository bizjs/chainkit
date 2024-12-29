import * as bitcoinjsLib from 'bitcoinjs-lib';
import { verifyMessage as unisatVerifyMessage } from '@unisat/wallet-utils';
import { BtcWallet, BITCOIN_MESSAGE_ECDSA } from '@okxweb3/coin-bitcoin';
import * as tinysecp from 'tiny-secp256k1';
import { ECPairAPI, ECPairFactory } from 'ecpair';

let initResult: { ecpair: ECPairAPI } | null = null;

function initBitconjsLibAndEccLib() {
  if (!initResult) {
    bitcoinjsLib.initEccLib(tinysecp);
    const ecpair = ECPairFactory(tinysecp);
    initResult = { ecpair };
  }

  return initResult;
}

export class BitcoinChain {
  private readonly ecpair: ECPairAPI;
  constructor() {
    initBitconjsLibAndEccLib();
    this.ecpair = initResult!.ecpair;
  }

  async verifyUnisatMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
    return unisatVerifyMessage(publicKey, message, signature);
  }

  async verifyEcdsaMessage(publicKey: string, message: string, signature: string): Promise<boolean> {
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

  async verifyBIP322Message(publicKey: string, message: string, signature: string): Promise<boolean> {
    // see link: https://github.com/bitcoinjs/bitcoinjs-lib/issues/1918
    const verified = this._verifyBip322(message, publicKey, signature);
    return verified;
  }

  private _verifyBip322(message: string, pubkey: string, signature: string) {
    const { payments } = bitcoinjsLib;
    const output = payments.p2wpkh({
      pubkey: Buffer.from(pubkey, 'hex'),
    }).output;
    if (output === undefined) {
      throw new Error('Only supports p2wpkh addresses for now');
    }
    const hash = this._taggedHash('BIP0322-signed-message', Buffer.from(message, 'utf8'));
    const sigBuff = Buffer.from(signature, 'base64');

    const toSpend = this._createToSpend(hash, output);
    const toSign = this._createToSign(toSpend, sigBuff);

    return this._validateP2wpkh(toSign);
  }
  /**
   * Validates the toSign transaction
   * @param {bitcoinJsLib.Transaction} toSign
   * @returns {boolean}
   */
  private _validateP2wpkh(toSign: bitcoinjsLib.Transaction): boolean {
    const { payments, Transaction, script } = bitcoinjsLib;
    // Verify the signatures in toSign transaction
    const [witnessSignature, pubkey] = toSign.ins[0].witness;
    // p2wpkh uses p2pkh script for creating the sighash for some reason
    const signingOutput = payments.p2pkh({ pubkey }).output;
    const hashForSigning = toSign.hashForWitnessV0(0, signingOutput, 0, Transaction.SIGHASH_ALL);

    const sig = script.signature.decode(witnessSignature);

    const pair = this.ecpair.fromPublicKey(pubkey);

    return pair.verify(hashForSigning, sig.signature);
  }

  /**
   * Tagged hashing
   * @param prefix
   * @param data
   * @returns
   */
  private _taggedHash(prefix: string, data: Buffer) {
    const crypto = bitcoinjsLib.crypto;
    const prefixHash = crypto.sha256(Buffer.from(prefix, 'utf8'));
    return crypto.sha256(Buffer.concat([prefixHash, prefixHash, data]));
  }

  /**
   * Creates the toSpend tx
   * @param messageHash
   * @param outputScript
   * @returns
   */
  private _createToSpend(messageHash: Buffer, outputScript: Buffer): bitcoinjsLib.Transaction {
    const { opcodes, Transaction } = bitcoinjsLib;
    const toSpend = new Transaction();
    toSpend.version = 0;
    toSpend.locktime = 0;
    toSpend.addInput(
      Buffer.alloc(32, 0),
      0xffffffff,
      0,
      Buffer.concat([Buffer.from([opcodes.OP_0, 0x20]), messageHash]),
    );
    toSpend.addOutput(outputScript, 0);
    return toSpend;
  }

  /**
   * Creates the toSign transaction
   * @param {bitcoinJsLib.Transaction} toSpend
   * @param {Buffer?} signature
   * @returns {bitcoinJsLib.Transaction}
   */
  private _createToSign(
    toSpend: bitcoinjsLib.Transaction,
    signature: Buffer | null = Buffer.from([]),
  ): bitcoinjsLib.Transaction {
    const { opcodes, Transaction, script } = bitcoinjsLib;

    if (signature.length === 65) {
      throw new Error('Legacy signatures can be handled with bitcoinjs-message');
    }
    let toSign: any;
    let isTx: boolean;
    try {
      toSign = Transaction.fromBuffer(signature);
      isTx = true;
    } catch (e) {
      // If serialization fails, it is a witnessStack only (simplified signature)
      toSign = new Transaction();
      isTx = false;
    }

    if (isTx) {
      const toSpendHash = toSpend.getHash();
      const input = toSign.ins[0];
      throw new Error('Invalid signature');
    } else {
      toSign.version = 0;
      toSign.locktime = 0;
      toSign.addOutput(Buffer.from([opcodes.OP_RETURN]), 0);
      toSign.addInput(toSpend.getHash(), 0, 0);
      if (signature.length > 0) {
        // We assume 1 input, so witness stack will only have one stack.
        // Skip the item count (first byte)
        toSign.ins[0].witness = script.toStack(signature.slice(1));
      }
    }
    return toSign;
  }

  /**
   * Get friendly address from publicKey or address
   * @param publicKey
   * @param options
   * @param options.addressType The address type, can use segwit_taproot(bc1p), segwit_native(bc1q)
   * @returns
   */
  async getAddress(
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
  getNativeAddress(publicKey: string): string {
    const { payments } = bitcoinjsLib;
    const p = payments.p2wpkh({
      pubkey: Buffer.from(publicKey, 'hex'),
    });
    const segwitAddress = p.address;

    // Will return bc1q address, see link: http://aandds.com/blog/bitcoin-key-addr.html#a0c40a52
    return segwitAddress;
  }
}
