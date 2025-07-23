import { Program, AnchorProvider, setProvider, Wallet } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import type {
  AllAccountsMap,
  AllInstructions,
  IdlAccounts,
  MakeMethodsNamespace,
} from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import type { Cluster, Commitment, Signer } from '@solana/web3.js';

export interface ContractClientBaseOptions {
  chainId?: string;
  idl?: any;
  walletClient: Wallet;
  endpoint: string;
}

export abstract class ContractClientBase<T extends Idl = Idl> {
  protected program: Program<T>;
  protected connection: Connection;
  protected wallet: Wallet;
  protected chainId: string;
  endpoint: string;

  constructor(contractInfo: ContractClientBaseOptions) {
    const { idl, walletClient, chainId, endpoint } = contractInfo;
    this.chainId = chainId || 'mainnet-beta';

    this.connection = this.getConnection();
    this.wallet = walletClient;
    this.endpoint = endpoint;

    const provider = new AnchorProvider(this.connection, this.wallet, { commitment: 'confirmed' });
    setProvider(provider);

    this.program = new Program(idl, provider);
  }

  get programId() {
    return this.program.programId;
  }

  protected getConnection() {
    const rpcUrl = this.endpoint ? this.endpoint : clusterApiUrl((this.chainId as Cluster) ?? 'mainnet-beta');

    const conn = new Connection(rpcUrl);
    return conn;
  }

  protected async findProgramAddress(
    seeds: Array<Buffer | Uint8Array>,
    programId?: PublicKey,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddressSync(seeds, programId || new PublicKey(this.program.idl.address));
  }

  async fetchAccountData<A extends keyof AllAccountsMap<T>>(
    accountName: A,
    address: PublicKey | string,
    commitment?: Commitment,
  ): Promise<IdlAccounts<T>[A]> {
    try {
      if (!this.program.account[accountName]) {
        throw new Error(`Account ${String(accountName)} not found in program`);
      }

      const account = await this.program.account[accountName].fetch(address, commitment);
      return account as IdlAccounts<T>[A];
    } catch (error) {
      throw error;
    }
  }

  async invokeView<M extends keyof MakeMethodsNamespace<T, AllInstructions<T>>>(
    methodName: M,
    args: Parameters<MakeMethodsNamespace<T, AllInstructions<T>>[M]>,
  ): Promise<any> {
    try {
      if (!this.program.methods[methodName]) {
        throw new Error(`Method ${methodName} not found in program`);
      }

      const result = await this.program.methods[methodName](...args).view();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async invokeInstruction<M extends keyof MakeMethodsNamespace<T, AllInstructions<T>>>(
    methodName: M,
    accounts: any,
    args: any,
    options?: { signers?: Signer[] },
  ): Promise<string> {
    if (!this.program.methods[methodName]) {
      throw new Error(`Method ${methodName} not found in program`);
    }
    let instruction = this.program.methods[methodName](...args).accounts(accounts);

    if (options?.signers?.length) {
      instruction = instruction.signers(options.signers);
    }

    const tx = await instruction.rpc();

    await this.confirmTransaction(tx);

    return tx;
  }

  async confirmTransaction(tx: string): Promise<string> {
    const latestBlockhash = await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction(
      {
        signature: tx,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      'finalized',
    );
    return tx;
  }
}
