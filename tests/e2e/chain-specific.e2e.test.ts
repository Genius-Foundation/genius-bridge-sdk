import { GeniusBridgeSdk } from '../../src/genius-bridge';
import { ChainIdEnum } from '../../src/types/enums';
import { 
  getTokenAddress, 
  getTestAddress, 
  getTestAmount,
  TEST_SLIPPAGE 
} from './test-data';

describe('GeniusBridge SDK Chain-Specific E2E Tests', () => {
  let sdk: GeniusBridgeSdk;

  beforeAll(() => {
    sdk = new GeniusBridgeSdk({
      debug: process.env['DEBUG'] === 'true',
      geniusBridgeBaseUrl: process.env['GENIUS_BRIDGE_BASE_URL'] || undefined,
    });
  });

  describe('Ethereum Chain Tests', () => {
    const chainId = ChainIdEnum.ETHEREUM;

    test('should fetch price from Ethereum to all other chains', async () => {
      const targetChains = [
        ChainIdEnum.POLYGON,
        ChainIdEnum.ARBITRUM,
        ChainIdEnum.OPTIMISM,
        ChainIdEnum.BSC,
        ChainIdEnum.AVALANCHE,
        ChainIdEnum.BASE,
        ChainIdEnum.SOLANA,
      ];

      const baseParams = {
        networkIn: chainId,
        tokenIn: getTokenAddress(chainId, 'NATIVE'),
        amountIn: getTestAmount('NATIVE', chainId),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(chainId),
      };

      for (const targetChain of targetChains) {
        const params = {
          ...baseParams,
          networkOut: targetChain,
          tokenOut: getTokenAddress(targetChain, 'USDC'),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(response.networkIn).toBe(chainId);
        expect(response.networkOut).toBe(targetChain);
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);

        console.log(`ETH->${targetChain}: ${response.amountOut} USDC for ${response.amountIn} ETH`);
      }
    });

    test('should handle different Ethereum token types', async () => {
      const targetChain = ChainIdEnum.POLYGON;
      const tokens = ['NATIVE', 'USDC', 'USDT', 'WETH'];

      for (const tokenType of tokens) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, tokenType as any),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount(tokenType, chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });
  });

  describe('Solana Chain Tests', () => {
    const chainId = ChainIdEnum.SOLANA;

    test('should fetch price from Solana to all EVM chains', async () => {
      const targetChains = [
        ChainIdEnum.ETHEREUM,
        ChainIdEnum.POLYGON,
        ChainIdEnum.ARBITRUM,
        ChainIdEnum.OPTIMISM,
        ChainIdEnum.BSC,
        ChainIdEnum.AVALANCHE,
        ChainIdEnum.BASE,
      ];

      const baseParams = {
        networkIn: chainId,
        tokenIn: getTokenAddress(chainId, 'SOL'),
        amountIn: getTestAmount('SOL', chainId),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(chainId),
      };

      for (const targetChain of targetChains) {
        const params = {
          ...baseParams,
          networkOut: targetChain,
          tokenOut: getTokenAddress(targetChain, 'NATIVE'),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(response.networkIn).toBe(chainId);
        expect(response.networkOut).toBe(targetChain);
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);

        console.log(`SOL->${targetChain}: ${response.amountOut} NATIVE for ${response.amountIn} SOL`);
      }
    });

    test('should handle different Solana token types', async () => {
      const targetChain = ChainIdEnum.ETHEREUM;
      const tokens = ['SOL', 'USDC', 'USDT', 'BONK'];

      for (const tokenType of tokens) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, tokenType as any),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount(tokenType, chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });

    test('should generate Solana execution payloads', async () => {
      const params = {
        networkIn: chainId,
        networkOut: ChainIdEnum.ETHEREUM,
        tokenIn: getTokenAddress(chainId, 'SOL'),
        tokenOut: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        amountIn: getTestAmount('SOL', chainId),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(chainId),
        to: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      const response = await sdk.fetchQuote(params);
      expect(response).toBeDefined();
      expect(response.svmExecutionPayload).toBeDefined();
      expect(Array.isArray(response.svmExecutionPayload)).toBe(true);
      expect(response.svmExecutionPayload!.length).toBeGreaterThan(0);
    });
  });

  describe('Layer 2 Chain Tests', () => {
    test('should handle Arbitrum cross-chain swaps', async () => {
      const chainId = ChainIdEnum.ARBITRUM;
      const targetChains = [ChainIdEnum.ETHEREUM, ChainIdEnum.POLYGON, ChainIdEnum.OPTIMISM];

      for (const targetChain of targetChains) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, 'NATIVE'),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount('NATIVE', chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });

    test('should handle Optimism cross-chain swaps', async () => {
      const chainId = ChainIdEnum.OPTIMISM;
      const targetChains = [ChainIdEnum.ETHEREUM, ChainIdEnum.ARBITRUM, ChainIdEnum.BASE];

      for (const targetChain of targetChains) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, 'NATIVE'),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount('NATIVE', chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });

    test('should handle Base cross-chain swaps', async () => {
      const chainId = ChainIdEnum.BASE;
      const targetChains = [ChainIdEnum.ETHEREUM, ChainIdEnum.OPTIMISM, ChainIdEnum.POLYGON];

      for (const targetChain of targetChains) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, 'NATIVE'),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount('NATIVE', chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });
  });

  describe('Alternative Chain Tests', () => {
    test('should handle Polygon cross-chain swaps', async () => {
      const chainId = ChainIdEnum.POLYGON;
      const targetChains = [ChainIdEnum.ETHEREUM, ChainIdEnum.BSC, ChainIdEnum.AVALANCHE];

      for (const targetChain of targetChains) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, 'NATIVE'),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount('NATIVE', chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });

    test('should handle BSC cross-chain swaps', async () => {
      const chainId = ChainIdEnum.BSC;
      const targetChains = [ChainIdEnum.ETHEREUM, ChainIdEnum.POLYGON, ChainIdEnum.AVALANCHE];

      for (const targetChain of targetChains) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, 'NATIVE'),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount('NATIVE', chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });

    test('should handle Avalanche cross-chain swaps', async () => {
      const chainId = ChainIdEnum.AVALANCHE;
      const targetChains = [ChainIdEnum.ETHEREUM, ChainIdEnum.POLYGON, ChainIdEnum.BSC];

      for (const targetChain of targetChains) {
        const params = {
          networkIn: chainId,
          networkOut: targetChain,
          tokenIn: getTokenAddress(chainId, 'NATIVE'),
          tokenOut: getTokenAddress(targetChain, 'USDC'),
          amountIn: getTestAmount('NATIVE', chainId),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(chainId),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases and Stress Tests', () => {
    test('should handle very small amounts', async () => {
      const params = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: '1000000000000000', // 0.001 ETH
        slippage: TEST_SLIPPAGE.HIGH, // Higher slippage for small amounts
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      const response = await sdk.fetchPrice(params);
      expect(response).toBeDefined();
      expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
    });

    test('should handle maximum slippage', async () => {
      const params = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        slippage: 10.0, // 10% slippage
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      const response = await sdk.fetchPrice(params);
      expect(response).toBeDefined();
      expect(response.slippage).toBe(10.0);
      expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
    });

    test('should handle rapid successive requests', async () => {
      const params = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      // Make 10 rapid requests
      const promises = Array(10).fill(null).map(() => sdk.fetchPrice(params));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      });
    }, 60000);
  });

  describe('Token Pair Specific Tests', () => {
    test('should handle stablecoin to stablecoin swaps', async () => {
      const stablecoinPairs = [
        { from: ChainIdEnum.AVALANCHE, to: ChainIdEnum.SOLANA },
        { from: ChainIdEnum.POLYGON, to: ChainIdEnum.SONIC },
        { from: ChainIdEnum.ARBITRUM, to: ChainIdEnum.AVALANCHE },
      ];

      for (const pair of stablecoinPairs) {
        const params = {
          networkIn: pair.from,
          networkOut: pair.to,
          tokenIn: getTokenAddress(pair.from, 'USDC'),
          tokenOut: getTokenAddress(pair.to, 'USDC'),
          amountIn: getTestAmount('USDC', pair.from),
          slippage: TEST_SLIPPAGE.LOW, // Low slippage for stablecoins
          from: getTestAddress(pair.from),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
        
        // Stablecoin swaps should have minimal price impact
        const ratio = parseFloat(response.amountOut) / parseFloat(response.amountIn);
        expect(ratio).toBeCloseTo(1, 1); // Within 10% of 1:1
      }
    });

    test('should handle wrapped token swaps', async () => {
      const wrappedTokenPairs = [
        { from: ChainIdEnum.ETHEREUM, to: ChainIdEnum.POLYGON },
        { from: ChainIdEnum.POLYGON, to: ChainIdEnum.ARBITRUM },
        { from: ChainIdEnum.ARBITRUM, to: ChainIdEnum.OPTIMISM },
      ];

      for (const pair of wrappedTokenPairs) {
        const params = {
          networkIn: pair.from,
          networkOut: pair.to,
          tokenIn: getTokenAddress(pair.from, 'WETH'),
          tokenOut: getTokenAddress(pair.to, 'WETH'),
          amountIn: getTestAmount('WETH', pair.from),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(pair.from),
        };

        const response = await sdk.fetchPrice(params);
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      }
    });
  });
}); 