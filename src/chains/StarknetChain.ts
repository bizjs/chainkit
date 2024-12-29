import { RpcProvider, Contract, typedData, constants, getChecksumAddress, RpcProviderOptions } from 'starknet';

import { safeParseJSON } from '../utils';

const ArgentAccount = {
  abi: [
    {
      name: 'braavos_account::account::interface::IBraavosAccount',
      type: 'interface',
      items: [
        {
          name: '__validate__',
          type: 'function',
          inputs: [
            {
              name: 'calls',
              type: 'core::array::Span::<core::starknet::account::Call>',
            },
          ],
          outputs: [
            {
              type: 'core::felt252',
            },
          ],
          state_mutability: 'external',
        },
        {
          name: '__execute__',
          type: 'function',
          inputs: [
            {
              name: 'calls',
              type: 'core::array::Span::<core::starknet::account::Call>',
            },
          ],
          outputs: [
            {
              type: 'core::array::Array::<core::array::Span::<core::felt252>>',
            },
          ],
          state_mutability: 'external',
        },
        {
          name: 'is_valid_signature',
          type: 'function',
          inputs: [
            {
              name: 'hash',
              type: 'core::felt252',
            },
            {
              name: 'signature',
              type: 'core::array::Span::<core::felt252>',
            },
          ],
          outputs: [
            {
              type: 'core::felt252',
            },
          ],
          state_mutability: 'view',
        },
        {
          name: '__validate_deploy__',
          type: 'function',
          inputs: [
            {
              name: 'class_hash',
              type: 'core::felt252',
            },
            {
              name: 'salt',
              type: 'core::felt252',
            },
            {
              name: 'stark_pub_key',
              type: 'braavos_account::signers::signers::StarkPubKey',
            },
          ],
          outputs: [
            {
              type: 'core::felt252',
            },
          ],
          state_mutability: 'view',
        },
        {
          name: '__validate_declare__',
          type: 'function',
          inputs: [
            {
              name: 'class_hash',
              type: 'core::felt252',
            },
          ],
          outputs: [
            {
              type: 'core::felt252',
            },
          ],
          state_mutability: 'view',
        },
        {
          name: 'initializer',
          type: 'function',
          inputs: [
            {
              name: 'stark_pub_key',
              type: 'braavos_account::signers::signers::StarkPubKey',
            },
          ],
          outputs: [],
          state_mutability: 'external',
        },
        {
          name: 'get_version',
          type: 'function',
          inputs: [],
          outputs: [
            {
              type: 'core::felt252',
            },
          ],
          state_mutability: 'view',
        },
        {
          name: 'get_required_signer',
          type: 'function',
          inputs: [
            {
              name: 'calls',
              type: 'core::array::Span::<core::starknet::account::Call>',
            },
            {
              name: 'fee_amount',
              type: 'core::integer::u128',
            },
            {
              name: 'tx_version',
              type: 'core::felt252',
            },
          ],
          outputs: [
            {
              type: 'braavos_account::account::interface::RequiredSigner',
            },
          ],
          state_mutability: 'external',
        },
      ],
    },
  ],
};

export class StarknetAccountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class StarknetChain {
  async verifyMessage(
    publicKey: string,
    message: string,
    signature: string,
    options?: {
      nodeUrl?: string;
      network?: constants.NetworkName;
    },
  ): Promise<boolean> {
    const rpcProviderOptions: RpcProviderOptions = {};
    if (options?.nodeUrl) {
      rpcProviderOptions.nodeUrl = options.nodeUrl;
    }
    if (options?.network) {
      if (options.network === constants.NetworkName.SN_MAIN) {
        rpcProviderOptions.chainId = constants.StarknetChainId.SN_MAIN;
      } else if (options.network === constants.NetworkName.SN_SEPOLIA) {
        rpcProviderOptions.chainId = constants.StarknetChainId.SN_SEPOLIA;
      } else {
        throw new Error('Invalid starknet network');
      }
    }

    const provider = new RpcProvider(rpcProviderOptions);
    const contractAccount = new Contract(ArgentAccount.abi, publicKey, provider);
    // call contract function is_valid_signature
    const msgHash = typedData.getMessageHash(safeParseJSON(message), publicKey);
    let verified: boolean;
    try {
      const result: bigint | { isValid: bigint } = await contractAccount.is_valid_signature(
        msgHash,
        String(signature || '').split(','),
      );
      if (typeof result === 'bigint') {
        verified = result > 0;
      } else {
        verified = result.isValid > 0;
      }
    } catch (err) {
      if (String(err?.message || '').includes('Contract not found')) {
        throw new StarknetAccountNotFoundError('Account contract not found on starknet');
      }
      throw err;
    }
    return verified;
  }

  getChecksumAddress(publicKey: string): string {
    return getChecksumAddress(publicKey);
  }
}
