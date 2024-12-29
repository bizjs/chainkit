import { Address, Hex } from 'viem';

import { EvmChain, ChainSdkFactory, ChainType } from '../src';

describe('evm-chain', () => {
  let sdk: EvmChain;

  beforeEach(() => {
    sdk = ChainSdkFactory.getChainSdk(ChainType.EVM);
  });

  const testData = {
    message:
      '{\n  "statement": "Welcome to EthSign",\n  "chainId": "1",\n  "address": "0xDfc4FbbDd9C47c7976fEBb14B1D37C7f85FE299D",\n  "issuedAt": "1689227809760",\n  "domain": "localhost",\n  "version": "1",\n  "nonce": "U2aFMKdq-Gp5XVssUULu7"\n}',
    publicKey: '0xDfc4FbbDd9C47c7976fEBb14B1D37C7f85FE299D',
    signature:
      '0xfad539e14951e49e49678a4de3eade59e6bff1ea216d1a16d57f16e6f0dc4fba538a2bbadf33e2f8e5eefc6e5df625743d987972a1df76ceda9a6cbb90126b4c1b',
    address: '0xDfc4FbbDd9C47c7976fEBb14B1D37C7f85FE299D',
  };

  // test data from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
  const testDataForEIP712 = {
    message: JSON.stringify({
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    }),
    publicKey: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    signature:
      '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c',
    address: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  };

  test('should verify message and get address', async () => {
    const verified = await sdk.verifyMessage(
      testData.publicKey as Address,
      testData.message,
      testData.signature as Hex,
    );
    expect(verified).toBe(true);

    const actualAddress = await sdk.getChecksumAddress(testData.publicKey);
    expect(actualAddress).toBe(testData.address);
  });

  test('should throw error if data invalid', async () => {
    await expect(sdk.verifyMessage('0xpublic', testData.message, testData.signature as Hex)).rejects.toThrow();
    await expect(sdk.verifyMessage(testData.publicKey as Address, testData.message, '11111' as any)).rejects.toThrow();
    await expect(sdk.verifyMessage(testData.publicKey as Address, 'xxxx', testData.signature as Hex)).resolves.toBe(
      false,
    );
  });

  test('should verify EIP712 message and get address', async () => {
    const verified = await sdk.verifyEIP712Message(
      testDataForEIP712.publicKey as Address,
      testDataForEIP712.message,
      testDataForEIP712.signature as Hex,
    );
    expect(verified).toBe(true);

    const actualAddress = await sdk.getChecksumAddress(testDataForEIP712.publicKey);
    expect(actualAddress).toBe(testDataForEIP712.address);
  });

  test('should throw error if EIP712 data invalid', async () => {
    await expect(
      sdk.verifyEIP712Message(testDataForEIP712.publicKey as Address, 'abcde', testDataForEIP712.signature as Hex),
    ).rejects.toThrow('Invalid typed data');
  });
});
