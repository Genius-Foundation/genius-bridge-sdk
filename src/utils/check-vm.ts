import { ChainIdEnum } from '../types/enums';

export function isEVMNetwork(network: ChainIdEnum): boolean {
  return (
    network === ChainIdEnum.ETHEREUM ||
    network === ChainIdEnum.ARBITRUM ||
    network === ChainIdEnum.OPTIMISM ||
    network === ChainIdEnum.POLYGON ||
    network === ChainIdEnum.BSC ||
    network === ChainIdEnum.AVALANCHE ||
    network === ChainIdEnum.BASE ||
    network == ChainIdEnum.SONIC
  );
}

export function isSolanaNetwork(network: ChainIdEnum): boolean {
  return network === ChainIdEnum.SOLANA;
}
