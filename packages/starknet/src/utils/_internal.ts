import { constants, RpcProvider, type RpcProviderOptions } from 'starknet';

export function _getProvider(options: { network: constants.NetworkName; nodeUrl?: string }) {
  const rpcProviderOptions: RpcProviderOptions = {};
  if (options.network === constants.NetworkName.SN_MAIN) {
    rpcProviderOptions.chainId = constants.StarknetChainId.SN_MAIN;
    rpcProviderOptions.nodeUrl = 'https://starknet-mainnet.public.blastapi.io';
  } else if (options.network === constants.NetworkName.SN_SEPOLIA) {
    rpcProviderOptions.chainId = constants.StarknetChainId.SN_SEPOLIA;
    rpcProviderOptions.nodeUrl = 'https://starknet-sepolia.public.blastapi.io';
  } else {
    throw new Error('Invalid starknet network');
  }
  if (options.nodeUrl) {
    rpcProviderOptions.nodeUrl = options.nodeUrl;
  }

  const provider = new RpcProvider(rpcProviderOptions);
  return provider;
}
