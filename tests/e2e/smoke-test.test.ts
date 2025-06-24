import { GeniusBridgeSdk } from '../../src/genius-bridge';
import { ChainIdEnum } from '../../src/types/enums';

describe('GeniusBridge SDK Smoke Test', () => {
  let sdk: GeniusBridgeSdk;

  beforeAll(() => {
    sdk = new GeniusBridgeSdk({
      debug: process.env['DEBUG'] === 'true',
    });
  });

  test('should initialize SDK correctly', () => {
    expect(sdk).toBeDefined();
    expect(sdk.chains).toBeDefined();
    expect(Array.isArray(sdk.chains)).toBe(true);
    expect(sdk.chains.length).toBeGreaterThan(0);
  });

  test('should have all required chains', () => {
    const requiredChains = [
      ChainIdEnum.ETHEREUM,
      ChainIdEnum.ARBITRUM,
      ChainIdEnum.OPTIMISM,
      ChainIdEnum.POLYGON,
      ChainIdEnum.BSC,
      ChainIdEnum.AVALANCHE,
      ChainIdEnum.BASE,
      ChainIdEnum.SOLANA,
    ];

    requiredChains.forEach(chain => {
      expect(sdk.chains).toContain(chain);
    });
  });

  test('should have valid base URL', () => {
    expect(sdk.baseUrl).toBeDefined();
    expect(typeof sdk.baseUrl).toBe('string');
    expect(sdk.baseUrl.length).toBeGreaterThan(0);
  });

  test('should reject same network swaps', async () => {
    const params = {
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.ETHEREUM,
      tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      tokenOut: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C',
      amountIn: '1000000000000000000',
      slippage: 0.5,
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    };

    await expect(sdk.fetchPrice(params)).rejects.toThrow(
      'Single chain swaps are not supported by GeniusBridge'
    );
  });

  test('should reject zero amount', async () => {
    const params = {
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.POLYGON,
      tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      tokenOut: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      amountIn: '0',
      slippage: 0.5,
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    };

    await expect(sdk.fetchPrice(params)).rejects.toThrow(
      'Amount in must be greater than 0'
    );
  });

  test('should reject invalid token address', async () => {
    const params = {
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.POLYGON,
      tokenIn: '0xInvalidAddress',
      tokenOut: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      amountIn: '1000000000000000000',
      slippage: 0.5,
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    };

    await expect(sdk.fetchPrice(params)).rejects.toThrow(
      'Invalid EVM token address'
    );
  });

  test('should reject quote without from address', async () => {
    const params = {
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.POLYGON,
      tokenIn: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C', // USDC
      tokenOut: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
      amountIn: '1000000000000000000',
      slippage: 0.5,
      from: '', // Empty from address
    };

    await expect(sdk.fetchQuote(params)).rejects.toThrow(
      'From address is required for quote'
    );
  });
}); 