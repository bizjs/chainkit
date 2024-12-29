import { Address, getAddress, Hex, verifyMessage, verifyTypedData } from 'viem';
import { safeParseJSON } from '../utils';

export class EvmChain {
  async verifyEIP712Message(address: Address, message: string, signature: Hex): Promise<boolean> {
    const typedData: {
      types: any;
      message: any;
      domain: any;
      primaryType: string;
    } = safeParseJSON(message);

    if (!typedData) {
      throw new Error('Invalid typed data');
    }

    const valid = await verifyTypedData({ ...typedData, address, signature });
    return valid;
  }

  async verifyMessage(address: Address, message: string, signature: Hex): Promise<boolean> {
    return verifyMessage({ address, message, signature });
  }

  async getChecksumAddress(address: string): Promise<string> {
    return getAddress(address);
  }
}
