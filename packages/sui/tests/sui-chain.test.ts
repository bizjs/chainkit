import { describe, expect, test } from 'vitest';
import { getDerivedAddress, verifyMessage, verifyMessageWithAddress } from '../src';
describe('aptos-chain', () => {
  const testData = {
    signature:
      'AC2hlMl11V0QJ6bSA+u7dCuNxPpDQ9S460XV4GGtM3p2Nb3vnm45nDPEvvTfzafvvjxKRR7B9AAPgj6tMnlIOgWqa+iS3CBYM7hlWG1cszjL2grBu9Sknw6xTiiTBbiZOw==',
    message:
      '{\n  "statement": "Welcome to TokenTable!",\n  "chainId": 1,\n  "address": "0x6af820c7e764a5ee8b60104d066c8824f969442a85c1ba7377bf94cda18042c7",\n  "issuedAt": "2025-08-08T02:28:01.227Z",\n  "domain": "localhost:5174",\n  "uri": "http://localhost:5174",\n  "version": "1",\n  "nonce": "jvgse12dsb"\n}',
    key: '00aa6be892dc205833b865586d5cb338cbda0ac1bbd4a49f0eb14e289305b8993b',
    chainType: 'sui',
    address: '0x6af820c7e764a5ee8b60104d066c8824f969442a85c1ba7377bf94cda18042c7',
  };
  const testDataFanton = {
    signature:
      'ABWM5Nh0RmNym9re+RyQS2eJyT0of7AAvp/MB8T3dkRBoaRVraBLVX84vIs33QL5FwG2OsMEkuXyn94cvBVJxwV8noQvMsXtCFB4ocRwhAImkdv19PVO48LzvMKbT2bH+Q==',
    message:
      '{\n  "statement": "Welcome to TokenTable!",\n  "chainId": 1,\n  "address": "0x74e108129df1a7d4abd58eda0c3983530433f2877069aaf7f25006721246d756",\n  "issuedAt": "2025-08-08T03:09:23.365Z",\n  "domain": "localhost:5174",\n  "uri": "http://localhost:5174",\n  "version": "1",\n  "nonce": "smhtrvzjn4"\n}',
    key: 'd35db8d79f35df6e3be74d7def6dfbf3cd35db4d7ad75f7ad75db5df6db7f35e39db5f76e39db8e36e39efcdb6ef5f78db8df5f3cd7de35e79efdd74db5f7ddb8f',
    chainType: 'sui',
    address: '0x74e108129df1a7d4abd58eda0c3983530433f2877069aaf7f25006721246d756',
  };
  const testDataOkx = {
    signature:
      'ABI9b/yLBXUDu31BO9zl+3DR7NtlehIAUOLm7eyD/EtSfyqCk6K4avBIMrdm42fLEHpT5vliNGgKrF5uiUJMAA0o/bKb15MtvWy6cdOLi61aw9isWs5Vxe+vWTZ7XkmZPQ==',
    message:
      '{\n  "statement": "Welcome to TokenTable!",\n  "chainId": 1,\n  "address": "0xb2e3c1057554e5d0c49b8c820ba71b671e07f2e62b4127e9b4a16eee5d7c40bf",\n  "issuedAt": "2025-08-08T03:09:52.307Z",\n  "domain": "localhost:5174",\n  "uri": "http://localhost:5174",\n  "version": "1",\n  "nonce": "onh34p4fub"\n}',
    key: '4b5032796d3965544c623173756e485469347574577350597246724f5663587672316b326531354a6d54303d',
    chainType: 'sui',
    address: '0xb2e3c1057554e5d0c49b8c820ba71b671e07f2e62b4127e9b4a16eee5d7c40bf',
  };

  test('should verify message and get derived address', async () => {
    const verified = await verifyMessage(testData.key, testData.message, testData.signature);
    expect(verified).toBe(true);

    const actualAddress = getDerivedAddress(testData.key);
    expect(actualAddress).toBe(testData.address);
  });

  test('should verify message with address', async () => {
    // fanton
    const verified = await verifyMessageWithAddress(
      testDataFanton.address,
      testDataFanton.message,
      testDataFanton.signature,
    );
    expect(verified).toBe(true);

    // okx
    const verifiedOkx = await verifyMessageWithAddress(testDataOkx.address, testDataOkx.message, testDataOkx.signature);
    expect(verifiedOkx).toBe(true);

    // default
    const verifiedDefault = await verifyMessageWithAddress(testData.address, testData.message, testData.signature);
    expect(verifiedDefault).toBe(true);
  });

  test('should get derived address', async () => {
    const actualAddress = getDerivedAddress(testData.key);
    expect(actualAddress).toBe(testData.address);
  });

  test('should throw error if data invalid', () => {
    expect(() => verifyMessage('0xpublic', testData.message, testData.signature)).rejects.toThrow(
      'Invalid public key input. Expected 32 bytes, got 0',
    );
    expect(() => verifyMessage(testData.key, testData.message, '11111')).rejects.toThrow(
      'The string to be decoded is not correctly encoded.',
    );
    expect(() => verifyMessage(testData.key, 'xxxx', testData.signature)).rejects.toThrow(
      'Signature is not valid for the provided message',
    );
  });
});
