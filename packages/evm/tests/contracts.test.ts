import { describe, expect, test } from 'vitest';
import { sepolia } from 'viem/chains';
import { ERC20ContractClient } from '../src';

describe('contracts tests', () => {
  test('erc20 tests', async () => {
    // https://sepolia.etherscan.io/token/0x1c7d4b196cb0c7b01d743fbc6116a902379c7238
    const erc20_usdc = new ERC20ContractClient({
      chain: sepolia,
      contractAddress: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
    });

    const metadata = await erc20_usdc.tokenMetadata();

    const [name, symbol, totalSupply, decimals] = await Promise.all([
      erc20_usdc.name(),
      erc20_usdc.symbol(),
      erc20_usdc.totalSupply(),
      erc20_usdc.decimals(),
    ]);

    expect(metadata.name).toBe(name);
    expect(metadata.symbol).toBe(symbol);
    expect(metadata.totalSupply).toBe(totalSupply);
    expect(metadata.decimals).toBe(decimals);

    expect(metadata).toStrictEqual({ name: 'USDC', symbol: 'USDC', totalSupply: 411951814911779444n, decimals: 6 });
  });
});
