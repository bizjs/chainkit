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

export abstract class ContractClientBase {
  private readonly publicClient: PublicClient;

  constructor(private readonly options: ContractClientBaseOptions) {
    // init public client
    this.publicClient = createPublicClient({
      chain: this.options.chain,
      transport: http(this.options.endpoint),
    });
  }

  protected async readContract<
    functionName extends ContractFunctionName<typeof this.options.abi, 'pure' | 'view'>,
    const args extends ContractFunctionArgs<typeof this.options.abi, 'pure' | 'view', functionName>,
  >(
    args: Pick<
      ReadContractParameters<typeof this.options.abi, functionName, args>,
      'args' | 'functionName' | 'blockNumber' | 'blockTag'
    >,
  ) {
    const result = await this.publicClient.readContract({
      abi: this.options.abi,
      address: this.options.contractAddress as `0x${string}`,
      functionName: args.functionName,
      args: args.args,
      blockNumber: args.blockNumber,
      blockTag: args.blockTag,
    });

    return result;
  }

  protected async simulateAndWriteContract<
    functionName extends ContractFunctionName<typeof this.options.abi, 'pure' | 'view'>,
    const args extends ContractFunctionArgs<typeof this.options.abi, 'pure' | 'view', functionName>,
  >(
    args: Pick<
      SimulateContractParameters<typeof this.options.abi, functionName, args, any, any, any>,
      'functionName' | 'account' | 'value' | 'nonce' | 'args'
    >,
  ) {
    if (!this.options.walletClient) {
      throw new Error('Wallet client is not initialized');
    }

    const { request } = await this.publicClient.simulateContract({
      abi: this.options.abi,
      address: this.options.contractAddress as Address,
      functionName: args.functionName,
      args: args.args,
      account: this.options.walletClient.account,
      value: args.value,
      nonce: args.nonce,
    });
    const result = await this.options.walletClient.writeContract(request);

    return result;
  }

  protected async multicall(parameters: MulticallParameters<any[], boolean>) {
    return await this.publicClient.multicall(parameters);
  }

  protected async waitForTransactionReceipt(args: WaitForTransactionReceiptParameters<typeof this.options.chain>) {
    return await this.publicClient.waitForTransactionReceipt(args);
  }
}
