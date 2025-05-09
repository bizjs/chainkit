import * as tinysecp from 'tiny-secp256k1';
import * as bitcoinjsLib from 'bitcoinjs-lib';
import { type ECPairAPI, ECPairFactory } from 'ecpair';

let initResult: { ecpair: ECPairAPI } | null = null;

export function _initBitconjsLibAndEccLib() {
  if (!initResult) {
    bitcoinjsLib.initEccLib(tinysecp);
    const ecpair = ECPairFactory(tinysecp);
    console.log('ecpair', ecpair);
    initResult = { ecpair };
  }
  return initResult!;
}

/**
 * Creates the toSign transaction
 * @param {bitcoinJsLib.Transaction} toSpend
 * @param {Buffer?} signature
 * @returns {bitcoinJsLib.Transaction}
 */
export function _createToSign(
  toSpend: bitcoinjsLib.Transaction,
  signature: Buffer = Buffer.from([]),
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
    // const toSpendHash = toSpend.getHash();
    // const input = toSign.ins[0];
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
 * Creates the toSpend tx
 * @param messageHash
 * @param outputScript
 * @returns
 */
export function _createToSpend(messageHash: Buffer, outputScript: Buffer): bitcoinjsLib.Transaction {
  const { opcodes, Transaction } = bitcoinjsLib;
  const toSpend = new Transaction();
  toSpend.version = 0;
  toSpend.locktime = 0;
  toSpend.addInput(Buffer.alloc(32, 0), 0xffffffff, 0, Buffer.concat([Buffer.from([opcodes.OP_0, 0x20]), messageHash]));
  toSpend.addOutput(outputScript, 0);
  return toSpend;
}

export function _verifyBip322(ecpair: ECPairAPI, message: string, pubkey: string, signature: string) {
  const { payments } = bitcoinjsLib;
  const output = payments.p2wpkh({
    pubkey: Buffer.from(pubkey, 'hex'),
  }).output;
  if (output === undefined) {
    throw new Error('Only supports p2wpkh addresses for now');
  }
  const hash = _taggedHash('BIP0322-signed-message', Buffer.from(message, 'utf8'));
  const sigBuff = Buffer.from(signature, 'base64');

  const toSpend = _createToSpend(hash, output);
  const toSign = _createToSign(toSpend, sigBuff);

  return _validateP2wpkh(ecpair, toSign);
}
/**
 * Validates the toSign transaction
 * @param {bitcoinJsLib.Transaction} toSign
 * @returns {boolean}
 */
export function _validateP2wpkh(ecpair: ECPairAPI, toSign: bitcoinjsLib.Transaction): boolean {
  const { payments, Transaction, script } = bitcoinjsLib;
  // Verify the signatures in toSign transaction
  const [witnessSignature, pubkey] = toSign.ins[0].witness;
  // p2wpkh uses p2pkh script for creating the sighash for some reason
  const signingOutput = payments.p2pkh({ pubkey }).output!;
  const hashForSigning = toSign.hashForWitnessV0(0, signingOutput, 0, Transaction.SIGHASH_ALL);

  const sig = script.signature.decode(witnessSignature);

  const pair = ecpair.fromPublicKey(pubkey);

  return pair.verify(hashForSigning, sig.signature);
}

/**
 * Tagged hashing
 * @param prefix
 * @param data
 * @returns
 */
export function _taggedHash(prefix: string, data: Buffer) {
  const crypto = bitcoinjsLib.crypto;
  const prefixHash = crypto.sha256(Buffer.from(prefix, 'utf8'));
  return crypto.sha256(Buffer.concat([prefixHash, prefixHash, data]));
}
