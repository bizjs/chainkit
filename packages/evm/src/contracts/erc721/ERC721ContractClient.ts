import { erc721Abi, type Address, type Hash } from 'viem';
import { ContractClientBase, type ContractClientBaseOptions } from '../ContractClientBase';
import type { ERC721TokenMetadata } from '../types';

export type ERC721ContractClientOptions = Omit<ContractClientBaseOptions, 'abi'>;

export class ERC721ContractClient extends ContractClientBase<typeof erc721Abi> {
  constructor(options: ERC721ContractClientOptions) {
    super({ ...options, abi: erc721Abi });
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

  async balanceOf(owner: Address) {
    const result = await this.readContract({ functionName: 'balanceOf', args: [owner] });
    return result as bigint;
  }

  async ownerOf(tokenId: bigint) {
    const result = await this.readContract({ functionName: 'ownerOf', args: [tokenId] });
    return result as Address;
  }

  async approve(to: Address, tokenId: bigint) {
    const result = await this.simulateAndWriteContract({ functionName: 'approve', args: [to, tokenId] });
    return result as Hash;
  }

  async setApprovalForAll(operator: Address, approved: boolean) {
    const result = await this.simulateAndWriteContract({
      functionName: 'setApprovalForAll',
      args: [operator, approved],
    });
    return result as Hash;
  }

  async transferFrom(from: Address, to: Address, tokenId: bigint) {
    const result = await this.simulateAndWriteContract({
      functionName: 'transferFrom',
      args: [from, to, tokenId],
    });
    return result as Hash;
  }

  async safeTransferFrom(from: Address, to: Address, tokenId: bigint, data?: `0x${string}`) {
    const args = data ? [from, to, tokenId, data] : [from, to, tokenId];
    const result = await this.simulateAndWriteContract({
      functionName: 'safeTransferFrom',
      args,
    });
    return result as Hash;
  }

  async tokenURI(tokenId: bigint) {
    const result = await this.readContract({ functionName: 'tokenURI', args: [tokenId] });
    return result as string;
  }

  async tokenMetadata() {
    const baseParams = { address: this.contractAddress, abi: this.abi };
    const multicallFunctions: { functionName: string; args?: unknown[] }[] = [
      { functionName: 'name' },
      { functionName: 'symbol' },
      { functionName: 'totalSupply' },
    ];
    const [name, symbol, totalSupply] = await this.multicall({
      contracts: multicallFunctions.map((item) => ({
        ...baseParams,
        functionName: item.functionName,
        args: item.args,
      })),
      allowFailure: false,
    });

    return { name, symbol, totalSupply } as ERC721TokenMetadata;
  }
}
