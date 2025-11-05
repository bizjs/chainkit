import { constants, getChecksumAddress } from 'starknet';
import { describe, expect, test } from 'vitest';

import { verifyMessage } from '../src';

describe('starknet-chain', () => {
  const testData = {
    message:
      '{"domain":{"chainId":"0x534e5f4d41494e","name":"EthSign","version":"1"},"message":{"statement":"Welcome to EthSign","chainId":"SN_MAIN","address":"0x24f376b3ad5a6b57bdac305d29675dd10729bd4bbe028d97468213f63feb961","issuedAt":"2023-12-05T03:28:43.141Z","domain":"localhost:3001","uri":"http://localhost:3001","version":"1","nonce":"7qf53eqx38"},"primaryType":"Sign","types":{"StarkNetDomain":[{"name":"name","type":"string"},{"name":"version","type":"felt"},{"name":"chainId","type":"felt"}],"Sign":[{"name":"statement","type":"string"},{"name":"chainId","type":"string"},{"name":"address","type":"string"},{"name":"issuedAt","type":"string"},{"name":"domain","type":"string"},{"name":"uri","type":"string"},{"name":"version","type":"string"},{"name":"nonce","type":"string"}]}}',
    publicKey: '0x24f376b3ad5a6b57bdac305d29675dd10729bd4bbe028d97468213f63feb961',
    signature:
      '1925025917343991298406425501741819164512204858611291923940765107513073853491,1880240539868667257244974252390017741240095075765493285023482693693242855779',
    address: '0x024f376B3AD5A6B57BdaC305d29675dd10729Bd4BbE028d97468213f63Feb961',
  };

  test('should verify message and get address', async () => {
    const verified = await verifyMessage(testData.publicKey, testData.message, testData.signature, {
      network: constants.NetworkName.SN_MAIN,
      // nodeUrl: 'https://starknet.drpc.org',
    });
    expect(verified).toBe(true);

    const actualAddress = await getChecksumAddress(testData.publicKey);
    expect(actualAddress).toBe(testData.address);
  });
});
