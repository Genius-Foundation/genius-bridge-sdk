import { ChainIdEnum } from '../../src/types/enums';

// Common token addresses for testing
export const TEST_TOKENS = {
  // EVM Native tokens (ETH, MATIC, etc.)
  NATIVE: {
    [ChainIdEnum.ETHEREUM]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    [ChainIdEnum.POLYGON]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    [ChainIdEnum.BSC]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    [ChainIdEnum.AVALANCHE]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    [ChainIdEnum.BASE]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    [ChainIdEnum.ARBITRUM]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    [ChainIdEnum.OPTIMISM]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    [ChainIdEnum.SONIC]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  },
  
  // USDC addresses
  USDC: {
    [ChainIdEnum.ETHEREUM]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [ChainIdEnum.POLYGON]: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    [ChainIdEnum.BSC]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    [ChainIdEnum.AVALANCHE]: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    [ChainIdEnum.BASE]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    [ChainIdEnum.ARBITRUM]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    [ChainIdEnum.OPTIMISM]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    [ChainIdEnum.SONIC]: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
  },
  
  // USDT addresses
  USDT: {
    [ChainIdEnum.ETHEREUM]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    [ChainIdEnum.POLYGON]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    [ChainIdEnum.BSC]: '0x55d398326f99059fF775485246999027B3197955',
    [ChainIdEnum.AVALANCHE]: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    [ChainIdEnum.BASE]: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    [ChainIdEnum.ARBITRUM]: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    [ChainIdEnum.OPTIMISM]: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  },
  
  // WETH addresses
  WETH: {
    [ChainIdEnum.ETHEREUM]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    [ChainIdEnum.POLYGON]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    [ChainIdEnum.BSC]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    [ChainIdEnum.AVALANCHE]: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    [ChainIdEnum.BASE]: '0x4200000000000000000000000000000000000006',
    [ChainIdEnum.ARBITRUM]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    [ChainIdEnum.OPTIMISM]: '0x4200000000000000000000000000000000000006',
    [ChainIdEnum.SONIC]: '0x50c42deacd8fc9773493ed674b675be577f2634b',
  },
  
  // Solana tokens
  SOLANA: {
    [ChainIdEnum.SOLANA]: {
      SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
      USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    }
  }
};

// Test addresses for different chains
export const TEST_ADDRESSES: Record<number, string> = {
  [ChainIdEnum.ETHEREUM]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.POLYGON]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.BSC]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.AVALANCHE]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.BASE]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.ARBITRUM]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.OPTIMISM]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.SONIC]: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  [ChainIdEnum.SOLANA]: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
};

// Chain and token-specific test amounts based on actual token values
export const TEST_AMOUNTS = {
  // Native tokens - amount that represents roughly $10 in value
  NATIVE: {
    [ChainIdEnum.ETHEREUM]: '4000000000000000', // ~$10 (0.001 ETH at ~$2500)
    [ChainIdEnum.POLYGON]: '50000000000000000000', // ~$10 (50 MATIC at ~$0.2)
    [ChainIdEnum.BSC]: '20000000000000000', // ~$10 (0.02 BNB at ~$500)
    [ChainIdEnum.AVALANCHE]: '4000000000000000000', // ~$10 (4 AVAX at ~$2.5)
    [ChainIdEnum.BASE]: '4000000000000000', // ~$10 (0.004 ETH at ~$2500)
    [ChainIdEnum.ARBITRUM]: '4000000000000000', // ~$10 (0.004 ETH at ~$2500)
    [ChainIdEnum.OPTIMISM]: '4000000000000000', // ~$10 (0.004 ETH at ~$2500)
    [ChainIdEnum.SONIC]: '40000000000000000000', // ~$10 (40 SONIC at ~$0.2)
  },
  // USDC - same across all chains (6 decimals)
  USDC: '10000000', // $10 USDC (6 decimals)
  // USDT - same across all chains (6 decimals)
  USDT: '10000000', // $10 USDT (6 decimals)
  // WETH - same as ETH values (18 decimals)
  WETH: '4000000000000000', // ~$10 (0.004 WETH at ~$2500)
  // Solana tokens
  SOL: '400000000', // ~$10 (0.4 SOL at ~$25)
  BONK: '100000000000', // ~$10 (1M BONK at ~$0.00001)
};

// Slippage values for testing
export const TEST_SLIPPAGE = {
  LOW: 0.1, // 0.1%
  MEDIUM: 0.5, // 0.5%
  HIGH: 1.0, // 1%
};

type TokenType = 'NATIVE' | 'USDC' | 'USDT' | 'WETH';
type SolanaTokenType = 'SOL' | 'USDC' | 'USDT' | 'BONK';

export function getTokenAddress(chainId: ChainIdEnum, tokenType: TokenType): string;
export function getTokenAddress(chainId: ChainIdEnum.SOLANA, tokenType: SolanaTokenType): string;
export function getTokenAddress(chainId: ChainIdEnum, tokenType: any): string {
  if (chainId === ChainIdEnum.SOLANA) {
    const solanaTokens = TEST_TOKENS.SOLANA[ChainIdEnum.SOLANA];
    const address = (solanaTokens as Record<string, string>)[tokenType];
    if (!address) {
      throw new Error(`Token type ${tokenType} not found for Solana`);
    }
    return address;
  }
  
  const evmTokens = TEST_TOKENS[tokenType as keyof typeof TEST_TOKENS];
  if (!evmTokens || typeof evmTokens === 'object' && 'SOLANA' in evmTokens) {
    throw new Error(`Token type ${tokenType} not found for EVM chains`);
  }
  
  const address = (evmTokens as Record<number, string>)[chainId];
  if (!address) {
    throw new Error(`Token type ${tokenType} not found for chain ${chainId}`);
  }
  
  return address;
}

export function getTestAddress(chainId: ChainIdEnum): string {
  const address = TEST_ADDRESSES[chainId as number];
  if (!address) {
    throw new Error(`Test address not found for chain ${chainId}`);
  }
  return address;
}

// Helper function to get appropriate test amount for a token and chain
export function getTestAmount(tokenType: string, chainId?: ChainIdEnum): string {
  if (tokenType === 'SOL') {
    return TEST_AMOUNTS.SOL;
  } else if (tokenType === 'BONK') {
    return TEST_AMOUNTS.BONK;
  } else if (tokenType === 'NATIVE' && chainId) {
    if (chainId === ChainIdEnum.SOLANA) {
      return TEST_AMOUNTS.SOL;
    }
    const amount = TEST_AMOUNTS.NATIVE[chainId as keyof typeof TEST_AMOUNTS.NATIVE];
    if (!amount) {
      throw new Error(`No test amount defined for chain ${chainId}`);
    }
    return amount;
  } else if (tokenType === 'USDC') {
    return TEST_AMOUNTS.USDC;
  } else if (tokenType === 'USDT') {
    // USDT has 18 decimals on BSC, 6 decimals on other chains
    if (chainId === ChainIdEnum.BSC) {
      return '10000000000000000000'; // $10 USDT (18 decimals on BSC)
    }
    return TEST_AMOUNTS.USDT;
  } else if (tokenType === 'WETH') {
    return TEST_AMOUNTS.WETH;
  }
  // Default to USDC amount for unknown tokens
  return TEST_AMOUNTS.USDC;
}

// Test scenarios for cross-chain swaps
export const TEST_SCENARIOS = [
  // EVM to EVM swaps
  // { from: ChainIdEnum.ETHEREUM, to: ChainIdEnum.POLYGON, tokenIn: 'NATIVE', tokenOut: 'USDC' },
  // { from: ChainIdEnum.ETHEREUM, to: ChainIdEnum.ARBITRUM, tokenIn: 'USDC', tokenOut: 'NATIVE' },
  // { from: ChainIdEnum.POLYGON, to: ChainIdEnum.BSC, tokenIn: 'USDT', tokenOut: 'USDC' },
  { from: ChainIdEnum.BSC, to: ChainIdEnum.AVALANCHE, tokenIn: 'WETH', tokenOut: 'NATIVE' },
  // { from: ChainIdEnum.AVALANCHE, to: ChainIdEnum.BASE, tokenIn: 'NATIVE', tokenOut: 'WETH' },
  // { from: ChainIdEnum.BASE, to: ChainIdEnum.OPTIMISM, tokenIn: 'USDC', tokenOut: 'USDT' },
  // { from: ChainIdEnum.ARBITRUM, to: ChainIdEnum.ETHEREUM, tokenIn: 'NATIVE', tokenOut: 'WETH' },
  // { from: ChainIdEnum.OPTIMISM, to: ChainIdEnum.POLYGON, tokenIn: 'WETH', tokenOut: 'NATIVE' },
  
  // // // EVM to Solana swaps
  // { from: ChainIdEnum.ETHEREUM, to: ChainIdEnum.SOLANA, tokenIn: 'NATIVE', tokenOut: 'SOL' },
  // { from: ChainIdEnum.POLYGON, to: ChainIdEnum.SOLANA, tokenIn: 'USDC', tokenOut: 'USDC' },
  // { from: ChainIdEnum.BSC, to: ChainIdEnum.SOLANA, tokenIn: 'USDT', tokenOut: 'USDT' },
  // { from: ChainIdEnum.AVALANCHE, to: ChainIdEnum.SOLANA, tokenIn: 'NATIVE', tokenOut: 'BONK' },
  
  // // // Solana to EVM swaps
  // { from: ChainIdEnum.SOLANA, to: ChainIdEnum.ETHEREUM, tokenIn: 'SOL', tokenOut: 'NATIVE' },
  // { from: ChainIdEnum.SOLANA, to: ChainIdEnum.POLYGON, tokenIn: 'USDC', tokenOut: 'USDC' },
  // { from: ChainIdEnum.SOLANA, to: ChainIdEnum.BSC, tokenIn: 'USDT', tokenOut: 'USDT' },
  // { from: ChainIdEnum.SOLANA, to: ChainIdEnum.AVALANCHE, tokenIn: 'BONK', tokenOut: 'NATIVE' },
]; 