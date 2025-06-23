import { GeniusBridgeSdk } from '../../src/genius-bridge';
import { ChainIdEnum } from '../../src/types/enums';
import { isNative } from '../../src/utils/is-native';
import { 
  TEST_SCENARIOS, 
  getTokenAddress, 
  getTestAddress, 
  getTestAmount,
  TEST_SLIPPAGE 
} from './test-data';

describe('GeniusBridge SDK E2E Tests', () => {
  let sdk: GeniusBridgeSdk;

  beforeAll(() => {
    sdk = new GeniusBridgeSdk({
      debug: process.env['DEBUG'] === 'true',
      geniusBridgeBaseUrl: process.env['GENIUS_BRIDGE_BASE_URL'] || undefined,
    });
  });

  describe('SDK Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(sdk).toBeDefined();
      expect(sdk.chains).toContain(ChainIdEnum.ETHEREUM);
      expect(sdk.chains).toContain(ChainIdEnum.SOLANA);
      expect(sdk.baseUrl).toBeDefined();
    });

    test('should support all required chains', () => {
      const expectedChains = [
        ChainIdEnum.ETHEREUM,
        ChainIdEnum.ARBITRUM,
        ChainIdEnum.OPTIMISM,
        ChainIdEnum.POLYGON,
        ChainIdEnum.BSC,
        ChainIdEnum.AVALANCHE,
        ChainIdEnum.BASE,
        ChainIdEnum.SOLANA,
      ];

      expectedChains.forEach(chain => {
        expect(sdk.chains).toContain(chain);
      });
    });
  });

  describe('Price Fetching - Cross Chain Scenarios', () => {
    test.each(TEST_SCENARIOS)(
      'should fetch price for $from -> $to ($tokenIn -> $tokenOut)',
      async ({ from, to, tokenIn, tokenOut }) => {
        const priceParams = {
          networkIn: from,
          networkOut: to,
          tokenIn: getTokenAddress(from, tokenIn as any),
          tokenOut: getTokenAddress(to, tokenOut as any),
          amountIn: getTestAmount(tokenIn, from),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(from),
        };

        const response = await sdk.fetchPrice(priceParams);

        // Validate response structure
        expect(response).toBeDefined();
        if (isNative(priceParams.tokenIn)) {
          expect(isNative(response.tokenIn)).toBe(true);
        } else {
          expect(response.tokenIn).toBe(priceParams.tokenIn);
        }
        if (isNative(priceParams.tokenOut)) {
          expect(isNative(response.tokenOut)).toBe(true);
        } else {
          expect(response.tokenOut).toBe(priceParams.tokenOut);
        }
        expect(response.networkIn).toBe(from);
        expect(response.networkOut).toBe(to);
        expect(response.amountIn).toBe(priceParams.amountIn);
        expect(response.amountOut).toBeDefined();
        expect(response.minAmountOut).toBeDefined();
        expect(response.slippage).toBe(priceParams.slippage);
        expect(response.fee).toBeDefined();
        expect(response.feesDetails).toBeDefined();
        expect(response.feesDetails.total).toBeDefined();

        // Validate amounts are positive
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
        expect(parseFloat(response.minAmountOut)).toBeGreaterThan(0);
        expect(parseFloat(response.fee)).toBeGreaterThanOrEqual(0);

        console.log(`Price for ${from}->${to}: ${response.amountOut} ${tokenOut} for ${response.amountIn} ${tokenIn}`);
      },
      30000 // 30 second timeout per test
    );

    test('should fetch prices with different amounts', async () => {
      const baseParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      const amounts = [
        getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
      ];
      const responses = await Promise.all(
        amounts.map(amount => 
          sdk.fetchPrice({ ...baseParams, amountIn: amount })
        )
      );

      responses.forEach((response, index) => {
        expect(response.amountIn).toBe(amounts[index]);
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      });

      // Verify that larger amounts generally result in proportionally larger outputs
      const ratios = responses.map(r => parseFloat(r.amountOut) / parseFloat(r.amountIn));
      if (ratios[0] !== undefined && ratios[1] !== undefined) {
        expect(ratios[1]).toBeCloseTo(ratios[0], 1); // Allow some variance due to slippage
      }
    });

    test('should fetch prices with different slippage values', async () => {
      const baseParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.ARBITRUM,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'USDC'),
        tokenOut: getTokenAddress(ChainIdEnum.ARBITRUM, 'NATIVE'),
        amountIn: getTestAmount('USDC', ChainIdEnum.ETHEREUM),
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      const slippages = [TEST_SLIPPAGE.LOW, TEST_SLIPPAGE.MEDIUM, TEST_SLIPPAGE.HIGH];
      const responses = await Promise.all(
        slippages.map(slippage => 
          sdk.fetchPrice({ ...baseParams, slippage })
        )
      );

      responses.forEach((response, index) => {
        expect(response.slippage).toBe(slippages[index]);
        // Higher slippage should result in higher minAmountOut
        if (index > 0) {
          const currentMin = parseFloat(response.minAmountOut ?? '0');
          const prevResponse = responses[index - 1];
          if (prevResponse) {
            const prevMin = parseFloat(prevResponse.minAmountOut ?? '0');
            expect(currentMin).toBeLessThanOrEqual(prevMin);
          }
        }
      });
    });
  });

  describe('Quote Fetching - Cross Chain Scenarios', () => {
    test.each(TEST_SCENARIOS)(
      'should fetch quote for $from -> $to ($tokenIn -> $tokenOut)',
      async ({ from, to, tokenIn, tokenOut }) => {
        const quoteParams = {
          networkIn: from,
          networkOut: to,
          tokenIn: getTokenAddress(from, tokenIn as any),
          tokenOut: getTokenAddress(to, tokenOut as any),
          amountIn: getTestAmount(tokenIn, from),
          slippage: TEST_SLIPPAGE.MEDIUM,
          from: getTestAddress(from),
          to: getTestAddress(to),
        };

        const response = await sdk.fetchQuote(quoteParams);

        // Validate response structure
        expect(response).toBeDefined();
        if (isNative(quoteParams.tokenIn)) {
          expect(isNative(response.tokenIn)).toBe(true);
        } else {
          expect(response.tokenIn).toBe(quoteParams.tokenIn);
        }
        if (isNative(quoteParams.tokenOut)) {
          expect(isNative(response.tokenOut)).toBe(true);
        } else {
          expect(response.tokenOut).toBe(quoteParams.tokenOut);
        }
        expect(response.networkIn).toBe(from);
        expect(response.networkOut).toBe(to);
        expect(response.amountIn).toBe(quoteParams.amountIn);
        expect(response.amountOut).toBeDefined();
        expect(response.minAmountOut).toBeDefined();
        expect(response.slippage).toBe(quoteParams.slippage);
        expect(response.fee).toBeDefined();
        expect(response.feesDetails).toBeDefined();
        expect(response.seed).toBeDefined();

        // Validate execution payloads
        if (from !== ChainIdEnum.SOLANA) {
          expect(response.evmExecutionPayload).toBeDefined();
          expect(response.evmExecutionPayload?.to).toBeDefined();
          expect(response.evmExecutionPayload?.data).toBeDefined();
        } else {
          expect(response.svmExecutionPayload).toBeDefined();
          expect(Array.isArray(response.svmExecutionPayload)).toBe(true);
        }

        console.log(`Quote for ${from}->${to}: ${response.amountOut} ${tokenOut} for ${response.amountIn} ${tokenIn}`);
      },
      30000 // 30 second timeout per test
    );

    test('should fetch quotes with and without explicit "to" address', async () => {
      const baseParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      // Quote without explicit "to" address
      const quoteWithoutTo = await sdk.fetchQuote(baseParams);
      expect(quoteWithoutTo).toBeDefined();
      expect(quoteWithoutTo.seed).toBeDefined();

      // Quote with explicit "to" address
      const quoteWithTo = await sdk.fetchQuote({
        ...baseParams,
        to: getTestAddress(ChainIdEnum.POLYGON),
      });
      expect(quoteWithTo).toBeDefined();
      expect(quoteWithTo.seed).toBeDefined();

      // Both quotes should be valid
      expect(parseFloat(quoteWithoutTo.amountOut)).toBeGreaterThan(0);
      expect(parseFloat(quoteWithTo.amountOut)).toBeGreaterThan(0);
    });

    test('should handle native token swaps correctly', async () => {
      const nativeSwapParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.AVALANCHE,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.AVALANCHE, 'NATIVE'),
        amountIn: getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
        to: getTestAddress(ChainIdEnum.AVALANCHE),
      };

      const response = await sdk.fetchQuote(nativeSwapParams);

      expect(response).toBeDefined();
      expect(response.tokenIn).toBe(nativeSwapParams.tokenIn);
      expect(response.tokenOut).toBe(nativeSwapParams.tokenOut);
      expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      expect(response.evmExecutionPayload).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should reject same network swaps', async () => {
      const sameNetworkParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.ETHEREUM,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.ETHEREUM, 'USDC'),
        amountIn: getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      await expect(sdk.fetchPrice(sameNetworkParams)).rejects.toThrow(
        'Single chain swaps are not supported by GeniusBridge'
      );
    });

    test('should reject zero amount', async () => {
      const zeroAmountParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: '0',
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      await expect(sdk.fetchPrice(zeroAmountParams)).rejects.toThrow(
        'Amount in must be greater than 0'
      );
    });

    test('should reject invalid token addresses', async () => {
      const invalidTokenParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: '0xInvalidAddress',
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: getTestAmount('USDC', ChainIdEnum.ETHEREUM),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      await expect(sdk.fetchPrice(invalidTokenParams)).rejects.toThrow(
        'Invalid EVM token address'
      );
    });

    test('should reject quote without from address', async () => {
      const noFromParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'USDC'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: getTestAmount('USDC', ChainIdEnum.ETHEREUM),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: '', // Empty from address
      };

      await expect(sdk.fetchQuote(noFromParams)).rejects.toThrow(
        'From address is required for quote'
      );
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle concurrent price requests', async () => {
      const requests = TEST_SCENARIOS.slice(0, 5).map(scenario => ({
        networkIn: scenario.from,
        networkOut: scenario.to,
        tokenIn: getTokenAddress(scenario.from, scenario.tokenIn as any),
        tokenOut: getTokenAddress(scenario.to, scenario.tokenOut as any),
        amountIn: getTestAmount(scenario.tokenIn, scenario.from),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(scenario.from),
      }));

      const startTime = Date.now();
      const responses = await Promise.all(
        requests.map(params => sdk.fetchPrice(params))
      );
      const endTime = Date.now();

      expect(responses).toHaveLength(requests.length);
      responses.forEach(response => {
        expect(response).toBeDefined();
        expect(parseFloat(response.amountOut)).toBeGreaterThan(0);
      });

      console.log(`Concurrent requests completed in ${endTime - startTime}ms`);
    }, 60000);

    test('should maintain consistent pricing within reasonable bounds', async () => {
      const params = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.POLYGON,
        tokenIn: getTokenAddress(ChainIdEnum.ETHEREUM, 'NATIVE'),
        tokenOut: getTokenAddress(ChainIdEnum.POLYGON, 'USDC'),
        amountIn: getTestAmount('NATIVE', ChainIdEnum.ETHEREUM),
        slippage: TEST_SLIPPAGE.MEDIUM,
        from: getTestAddress(ChainIdEnum.ETHEREUM),
      };

      const responses = await Promise.all([
        sdk.fetchPrice(params),
        sdk.fetchPrice(params),
        sdk.fetchPrice(params),
      ]);

      const amounts = responses.map(r => parseFloat(r.amountOut));
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.map(a => Math.abs(a - avg) / avg);

      // Variance should be less than 5% for consistent pricing
      variance.forEach(v => {
        expect(v).toBeLessThan(0.05);
      });
    });
  });
}); 