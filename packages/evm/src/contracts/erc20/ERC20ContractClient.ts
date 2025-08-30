import { erc20Abi, type Address, type Hash } from 'viem';
import { ContractClientBase, type ContractClientBaseOptions } from '../ContractClientBase';
import type { ERC20TokenMetadata } from '../types';

export type ERC20ContractClientOptions = Omit<ContractClientBaseOptions, 'abi'>;

export class ERC20ContractClient extends ContractClientBase<typeof erc20Abi> {
  constructor(options: ERC20ContractClientOptions) {
    super({ ...options, abi: erc20Abi });
  }

  async name() {
    const result = await this.readContract({ functionName: 'name' });
    return result as string;
  }

  async symbol() {
    const result = await this.readContract({ functionName: 'symbol' });
    return result as string;
  }

  async totalSupply() {
    const result = await this.readContract({ functionName: 'totalSupply' });
    return result as bigint;
  }

  async decimals() {
    const result = await this.readContract({ functionName: 'decimals' });
    return result as number;
  }

  async balanceOf(owner: Address) {
    const result = await this.readContract({ functionName: 'balanceOf', args: [owner] });
    return result as bigint;
  }

  async batchBalanceOf(addresses: Address[], allowFailure = false) {
    const results = await this.multicall({
      contracts: addresses.map((address) => ({
        ...this.multicallParamsBase,
        functionName: 'balanceOf',
        args: [address],
      })),
      allowFailure,
    });
    return results;
  }

  async allowance(owner: Address, spender: Address) {
    const result = await this.readContract({ functionName: 'allowance', args: [owner, spender] });
    return result as bigint;
  }

  async approve(spender: Address, amount: bigint) {
    const result = await this.simulateAndWriteContract({ functionName: 'approve', args: [spender, amount] });
    return result as Hash;
  }

  async transfer(recipient: Address, amount: bigint) {
    const result = await this.simulateAndWriteContract({ functionName: 'transfer', args: [recipient, amount] });
    return result as Hash;
  }

  async transferFrom(sender: Address, recipient: Address, amount: bigint) {
    const result = await this.simulateAndWriteContract({
      functionName: 'transferFrom',
      args: [sender, recipient, amount],
    });
    return result as Hash;
  }

  async tokenMetadata() {
    const baseParams = { address: this.contractAddress, abi: this.abi };
    const multicallFunctions: { functionName: string; args?: unknown[] }[] = [
      { functionName: 'name' },
      { functionName: 'symbol' },
      { functionName: 'totalSupply' },
      { functionName: 'decimals' },
    ];
    const [name, symbol, totalSupply, decimals] = await this.multicall({
      contracts: multicallFunctions.map((item) => ({
        ...baseParams,
        functionName: item.functionName,
        args: item.args,
      })),
      allowFailure: false,
    });

    return { name, symbol, totalSupply, decimals } as ERC20TokenMetadata;
  }
}
