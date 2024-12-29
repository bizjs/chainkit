import { BitcoinChain, ChainSdkFactory, ChainType } from '../src';

describe('bitcoin-chain', () => {
  let sdk: BitcoinChain;
  beforeEach(() => {
    sdk = ChainSdkFactory.getChainSdk(ChainType.Bitcoin);
  });

  const testDataForBip322 = {
    message:
      '{\n  "statement": "Welcome to EthSign",\n  "chainId": "",\n  "address": "bc1qqwz92srtn5fvprtcdcj2myrq2wegf0r8h5rdh8",\n  "issuedAt": "1689299676446",\n  "domain": "localhost",\n  "version": "1",\n  "nonce": "ko5pq-4mrYVkAb4QbdDnO"\n}',
    publicKey: '024847a027df62344df48bff8ff1fb1c48c153263ae3517ac1b19f352223b24e88',
    signature:
      'AkcwRAIgdn9UYUPU/8mUovNnlrQDgdYh+4l7cIDVf/UoDkSea1ACIDeXbhaV28VWadikFYr0VKS/8GAFvSa4ul+2XYJSuVPQASECSEegJ99iNE30i/+P8fscSMFTJjrjUXrBsZ81IiOyTog=',
    nativeAddress: 'bc1qqwz92srtn5fvprtcdcj2myrq2wegf0r8h5rdh8',
    taprootAddress: 'bc1pc9nm2astdy36s3n6pf2q0247wlwr8jcm3gk8z4sn32c7vwjaqkzqnh52yy',
  };

  const testDataForUnisat = {
    message:
      '{\n  "statement": "Welcome to EthSign",\n  "chainId": 1,\n  "address": "bc1qnn44n5fkc6pwqrtk4fezx7sx5apmqwk2nxnzcq",\n  "issuedAt": "2023-12-18T09:53:14.752Z",\n  "domain": "localhost:3001",\n  "uri": "http://localhost:3001",\n  "version": "1",\n  "nonce": "7ew7r3f2za"\n}',
    publicKey: '03ec82db8e23b48c45808d382d9ee9fb4d9d13a8b707f3b31508891f0bdc8f056b',
    signature: 'HMtSGcOEgoaJuvStNPfYWIU0Wvujphx+HZSUb0EBNKV+Ap0z6lLRXqcoj00EeIxgGaOiUvila51pvQCEXpZgR/A=',
  };

  const testDataForEcdsa = {
    message:
      '{\n  "statement": "Welcome to EthSign",\n  "chainId": 1,\n  "address": "bc1p46edm45gtpnlazdqwqyfrjwfjqh44gxz7xqlffzxjkw5pq6jnckqh6u4mu",\n  "issuedAt": "2023-12-20T08:00:22.127Z",\n  "domain": "localhost:3001",\n  "uri": "http://localhost:3001",\n  "version": "1",\n  "nonce": "xv4bq55iyg"\n}',
    publicKey: '024129ead5f832cb59879b8518a52df76954e1ae08462146d0320a51d42a1d751a',
    signature: 'IJpn2IS8m7oefliAXAx+1p04xpH1ySvhrvR2q56m9lxeah4QIRI/bvxOkV2WiMR39kbR3yv+UBpoVRlUmMh/8R4=',
    address: 'bc1p46edm45gtpnlazdqwqyfrjwfjqh44gxz7xqlffzxjkw5pq6jnckqh6u4mu',
  };

  test('should verify bip322 message and get address', async () => {
    const verified = await sdk.verifyBIP322Message(
      testDataForBip322.publicKey,
      testDataForBip322.message,
      testDataForBip322.signature,
    );
    expect(verified).toBe(true);

    let actualAddress = await sdk.getAddress(testDataForBip322.publicKey, 'segwit_native');
    expect(actualAddress).toBe(testDataForBip322.nativeAddress);

    actualAddress = await sdk.getAddress(testDataForBip322.publicKey, 'segwit_taproot');
    expect(actualAddress).toBe(testDataForBip322.taprootAddress);

    actualAddress = sdk.getNativeAddress(testDataForBip322.publicKey);
    expect(actualAddress).toBe(testDataForBip322.nativeAddress);
  });

  test('should throw error when get address with invalid address type', async () => {
    await expect(sdk.getAddress(testDataForBip322.publicKey, 'invalid' as any)).rejects.toThrow('Invalid addressType');
  });

  test('should verify unisat message and get data', async () => {
    const verified = await sdk.verifyUnisatMessage(
      testDataForUnisat.publicKey,
      testDataForUnisat.message,
      testDataForUnisat.signature,
    );
    expect(verified).toBe(true);
  });

  test('should verify ecdsa message and get address', async () => {
    const verified = await sdk.verifyEcdsaMessage(
      testDataForEcdsa.publicKey,
      testDataForEcdsa.message,
      testDataForEcdsa.signature,
    );
    expect(verified).toBe(true);
    
    const actualAddress = await sdk.getAddress(testDataForEcdsa.publicKey, 'segwit_taproot');
    expect(actualAddress).toBe(testDataForEcdsa.address);
  });
});
