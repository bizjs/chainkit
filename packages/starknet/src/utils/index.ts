import { Contract, typedData, constants } from 'starknet';
import { AccountABI } from './accountAbi';
import { _getProvider } from './_internal';

export class StarknetAccountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function verifyMessage(
  publicKey: string,
  message: string,
  signature: string,
  options: {
    network: constants.NetworkName;
    nodeUrl?: string;
  },
): Promise<boolean> {
  const provider = _getProvider(options);
  const contractAccount = new Contract(AccountABI, publicKey, provider);
  // call contract function is_valid_signature

  let verified: boolean;
  try {
    const msgHash = typedData.getMessageHash(JSON.parse(message), publicKey);
    const result: bigint | { isValid: bigint } = await contractAccount.is_valid_signature(
      msgHash,
      String(signature || '').split(','),
    );
    if (typeof result === 'bigint') {
      verified = result > 0;
    } else {
      verified = result.isValid > 0;
    }
  } catch (err: any) {
    if (String(err?.message || '').includes('Contract not found')) {
      throw new StarknetAccountNotFoundError('Account contract not found on starknet');
    }
    throw err;
  }
  return verified;
}
