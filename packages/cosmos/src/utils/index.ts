import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { fromBase64 } from '@cosmjs/encoding';

const verifyMessageDefaults = {
  bech32PrefixAccAddr: 'cosmos',
  algo: 'secp256k1',
} as const;
/**
 * Verify message with public key and signature
 * @param publicKey public key, not address
 * @param message
 * @param signature
 * @param address
 * @param options
 * @param options.bech32PrefixAccAddr Bech32 prefix for the account address, default is 'cosmos'
 * @param options.algo Algorithm used for verification, default is 'secp256k1'
 * - 'secp256k1' for Cosmos SDK
 * - 'ethsecp256k1' for Ethereum compatible chains
 * @returns
 */
export function verifyMessage(
  publicKeyBase64: string,
  message: string,
  signatureBase64: string,
  address: string,
  options?: {
    bech32PrefixAccAddr?: string;
    algo?: 'secp256k1' | 'ethsecp256k1';
  },
): boolean {
  const pubKeyBytes = fromBase64(publicKeyBase64);
  const signatureBytes = fromBase64(signatureBase64);

  const opts = { ...verifyMessageDefaults, ...options };

  return verifyADR36Amino(opts.bech32PrefixAccAddr, address, message, pubKeyBytes, signatureBytes, opts.algo);
}
