import { createPublicClient, http } from 'viem';
import type {
  Chain,
  PublicClient,
  WalletClient,
  MulticallParameters,
  Abi,
  Address,
  ContractFunctionName,
  ContractFunctionArgs,
  ReadContractParameters,
  SimulateContractParameters,
  WaitForTransactionReceiptParameters,
} from 'viem';

export type ContractClientBaseOptions = {
  contractAddress: Address;
  abi: Abi;
  chain: Chain;
  endpoint?: string;
  walletClient?: WalletClient;
};

export abstract class ContractClientBase<TAbi extends Abi> {
  private readonly publicClient: PublicClient;

  protected readonly abi: Abi;
  protected readonly contractAddress: Address;
  private readonly chain: Chain;
  private readonly walletClient: WalletClient | undefined;

  constructor(options: ContractClientBaseOptions) {
    this.abi = options.abi;
    this.contractAddress = options.contractAddress;
    this.chain = options.chain;
    this.walletClient = options.walletClient;

    // init public client
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(options.endpoint),
    });
  }

  protected async readContract<
    functionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
    const args extends ContractFunctionArgs<TAbi, 'pure' | 'view', functionName>,
  >(
    args: Pick<ReadContractParameters<TAbi, functionName, args>, 'args' | 'functionName' | 'blockNumber' | 'blockTag'>,
  ) {
    const result = await this.publicClient.readContract({
      abi: this.abi,
      address: this.contractAddress,
      functionName: args.functionName,
      args: args.args as unknown[],
      blockNumber: args.blockNumber,
      blockTag: args.blockTag,
    });

    return result;
  }

  protected async simulateAndWriteContract<
    functionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
    const args extends ContractFunctionArgs<TAbi, 'pure' | 'view', functionName>,
  >(
    args: Pick<
      SimulateContractParameters<TAbi, functionName, args, any, any, any>,
      'functionName' | 'account' | 'value' | 'nonce' | 'args'
    >,
  ) {
    if (!this.walletClient) {
      throw new Error('Wallet client is not initialized');
    }

    const { request } = await this.publicClient.simulateContract({
      abi: this.abi,
      address: this.contractAddress,
      functionName: args.functionName,
      args: args.args as unknown[],
      account: this.walletClient.account,
      value: args.value,
      nonce: args.nonce,
    });
    const result = await this.walletClient.writeContract(request);

    return result;
  }

  protected async multicall(parameters: MulticallParameters<any[], boolean>) {
    return await this.publicClient.multicall(parameters);
  }

  protected async waitForTransactionReceipt(args: WaitForTransactionReceiptParameters<typeof this.chain>) {
    return await this.publicClient.waitForTransactionReceipt(args);
  }
}
