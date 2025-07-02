import { type Address, type Hex, verifyTypedData, verifyMessage as viem_verifyMessage } from 'viem';

export async function verifyMessage(address: Address, message: string, signature: Hex): Promise<boolean> {
  return viem_verifyMessage({ address, message, signature });
}

export async function verifyEIP712Message(address: Address, message: string, signature: Hex): Promise<boolean> {
  let typedData: any;
  try {
    typedData = JSON.parse(message);
  } catch (error) {
    throw new Error('Invalid typed data');
  }

  const valid = await verifyTypedData({ ...typedData, address, signature });
  return valid;
}

export async function getBalance() {}

export async function getTokenBalance() {}

export async function getTokenDecimals() {}

export async function getTokenInfo() {}
