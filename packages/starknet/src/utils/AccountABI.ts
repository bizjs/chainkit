export const AccountABI = [
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
];
