import axios from 'axios';
import { GeniusBridgeSdk } from '../src/genius-bridge';
import { ChainIdEnum } from '../src/types/enums';
import { NATIVE_ADDRESS, SOL_NATIVE_ADDRESS } from '../src/utils/constants';
import { ILogger, LoggerFactory, LogLevelEnum } from '../src/utils/logger';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger
jest.mock('../src/utils/logger');
const mockedLoggerFactory = LoggerFactory as jest.Mocked<typeof LoggerFactory>;
const mockedLogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
} as jest.Mocked<ILogger>;

describe('GeniusBridgeSdk', () => {
  let sdk: GeniusBridgeSdk;
  let mockAxiosPost: jest.MockedFunction<typeof axios.post>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup logger mock
    mockedLoggerFactory.getLogger.mockReturnValue(mockedLogger);
    mockedLoggerFactory.createConsoleLogger.mockReturnValue(mockedLogger);
    mockedLoggerFactory.configure.mockReturnValue(undefined);

    // Setup axios mock
    mockAxiosPost = mockedAxios.post as jest.MockedFunction<typeof axios.post>;
    
    sdk = new GeniusBridgeSdk();
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      expect(sdk.baseUrl).toBe('https://bridge-api.tradegeniuses.net');
      expect(sdk.chains).toContain(ChainIdEnum.ETHEREUM);
      expect(sdk.chains).toContain(ChainIdEnum.SOLANA);
    });

    it('should initialize with custom base URL', () => {
      const customSdk = new GeniusBridgeSdk({
        geniusBridgeBaseUrl: 'https://custom-api.example.com'
      });
      expect(customSdk.baseUrl).toBe('https://custom-api.example.com');
    });

    it('should configure debug logger when debug is true', () => {
      new GeniusBridgeSdk({ debug: true });
      expect(mockedLoggerFactory.configure).toHaveBeenCalledWith(
        mockedLoggerFactory.createConsoleLogger({ level: LogLevelEnum.DEBUG })
      );
    });

    it('should configure custom logger when provided', () => {
      const customLogger = {} as ILogger;
      new GeniusBridgeSdk({ logger: customLogger });
      expect(mockedLoggerFactory.configure).toHaveBeenCalledWith(customLogger);
    });
  });

  describe('isCorrectConfig', () => {
    it('should always return true for any config', () => {
      const config = { someKey: 'someValue' };
      expect(sdk.isCorrectConfig(config)).toBe(true);
    });
  });

  describe('fetchPrice', () => {
    const validPriceParams = {
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.SOLANA,
      tokenIn: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenOut: 'So11111111111111111111111111111111111111112',
      amountIn: '1000000000000000000',
      slippage: 0.5,
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    };

    const mockPriceResponse = {
      tokenIn: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenOut: 'So11111111111111111111111111111111111111112',
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.SOLANA,
      amountIn: '1000000000000000000',
      amountOut: '5000000000',
      minAmountOut: '4975000000',
      slippage: 0.5,
      fee: '25000000000000000',
      feesDetails: {
        base: '10000000000000000',
        bps: '15000000000000000',
        insurance: '0',
        total: '25000000000000000'
      }
    };

    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: mockPriceResponse });
    });

    it('should fetch price successfully', async () => {
      const result = await sdk.fetchPrice(validPriceParams);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bridge-api.tradegeniuses.net/quoting/price',
        validPriceParams
      );
      expect(result).toEqual(mockPriceResponse);
    });

    it('should throw error for same network', async () => {
      const invalidParams = {
        ...validPriceParams,
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.ETHEREUM
      };

      await expect(sdk.fetchPrice(invalidParams)).rejects.toThrow(
        'Single chain swaps are not supported by GeniusBridge'
      );
    });

    it('should throw error for unsupported input network', async () => {
      const invalidParams = {
        ...validPriceParams,
        networkIn: 999999
      };

      await expect(sdk.fetchPrice(invalidParams)).rejects.toThrow(
        'Network 999999 not supported by GeniusBridge'
      );
    });

    it('should throw error for unsupported output network', async () => {
      const invalidParams = {
        ...validPriceParams,
        networkOut: 999999
      };

      await expect(sdk.fetchPrice(invalidParams)).rejects.toThrow(
        'Network 999999 not supported by GeniusBridge'
      );
    });

    it('should throw error for zero amount', async () => {
      const invalidParams = {
        ...validPriceParams,
        amountIn: '0'
      };

      await expect(sdk.fetchPrice(invalidParams)).rejects.toThrow(
        'Amount in must be greater than 0'
      );
    });

    it('should throw error for invalid EVM token address', async () => {
      const invalidParams = {
        ...validPriceParams,
        tokenIn: 'invalid-address'
      };

      await expect(sdk.fetchPrice(invalidParams)).rejects.toThrow(
        'Invalid EVM token address: invalid-address'
      );
    });

    it('should throw error for invalid Solana token address', async () => {
      const invalidParams = {
        networkIn: ChainIdEnum.SOLANA,
        networkOut: ChainIdEnum.ETHEREUM,
        tokenIn: 'invalid-solana-address',
        tokenOut: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amountIn: '1000000000000000000',
        slippage: 0.5,
        from: 'So11111111111111111111111111111111111111112'
      };

      await expect(sdk.fetchPrice(invalidParams)).rejects.toThrow(
        'Invalid Solana token address: invalid-solana-address'
      );
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockAxiosPost.mockRejectedValue(apiError);

      await expect(sdk.fetchPrice(validPriceParams)).rejects.toThrow(
        'Failed to fetch GeniusBridge price, error: API Error'
      );
      expect(mockedLogger.error).toHaveBeenCalledWith('Failed to fetch price', apiError);
    });

    it('should handle native token addresses correctly', async () => {
      const nativeParams = {
        ...validPriceParams,
        tokenIn: 'ETH',
        tokenOut: 'SOL'
      };

      await sdk.fetchPrice(nativeParams);

      // fetchPrice doesn't transform native tokens, it passes them as-is
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bridge-api.tradegeniuses.net/quoting/price',
        expect.objectContaining({
          tokenIn: 'ETH',
          tokenOut: 'SOL'
        })
      );
    });
  });

  describe('fetchQuote', () => {
    const validQuoteParams = {
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.SOLANA,
      tokenIn: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenOut: 'So11111111111111111111111111111111111111112',
      amountIn: '1000000000000000000',
      slippage: 0.5,
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      to: 'So11111111111111111111111111111111111111112'
    };

    const mockQuoteResponse = {
      tokenIn: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenOut: 'So11111111111111111111111111111111111111112',
      networkIn: ChainIdEnum.ETHEREUM,
      networkOut: ChainIdEnum.SOLANA,
      amountIn: '1000000000000000000',
      amountOut: '5000000000',
      minAmountOut: '4975000000',
      slippage: 0.5,
      fee: '25000000000000000',
      feesDetails: {
        base: '10000000000000000',
        bps: '15000000000000000',
        insurance: '0',
        total: '25000000000000000'
      },
      seed: 'test-seed-123',
      authority: {
        networkInAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        networkOutAddress: 'So11111111111111111111111111111111111111112'
      }
    };

    beforeEach(() => {
      mockAxiosPost.mockResolvedValue({ data: mockQuoteResponse });
    });

    it('should fetch quote successfully', async () => {
      const result = await sdk.fetchQuote(validQuoteParams);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bridge-api.tradegeniuses.net/quoting/quote',
        expect.objectContaining({
          ...validQuoteParams,
          authority: {
            networkInAddress: validQuoteParams.from,
            networkOutAddress: validQuoteParams.to
          }
        })
      );
      expect(result).toEqual(mockQuoteResponse);
    });

    it('should use from address as to address when to is not provided', async () => {
      const paramsWithoutTo = {
        ...validQuoteParams,
        to: undefined
      };

      await sdk.fetchQuote(paramsWithoutTo);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bridge-api.tradegeniuses.net/quoting/quote',
        expect.objectContaining({
          authority: {
            networkInAddress: validQuoteParams.from,
            networkOutAddress: validQuoteParams.from
          }
        })
      );
    });

    it('should throw error when from address is missing', async () => {
      const invalidParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.SOLANA,
        tokenIn: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        tokenOut: 'So11111111111111111111111111111111111111112',
        amountIn: '1000000000000000000',
        slippage: 0.5,
        from: undefined as any,
        to: 'So11111111111111111111111111111111111111112'
      };

      await expect(sdk.fetchQuote(invalidParams)).rejects.toThrow(
        'From address is required for quote'
      );
    });

    it('should throw error for invalid receiver address', async () => {
      const invalidParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.SOLANA,
        tokenIn: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        tokenOut: 'So11111111111111111111111111111111111111112',
        amountIn: '1000000000000000000',
        slippage: 0.5,
        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        to: 'invalid-receiver-address'
      };

      await expect(sdk.fetchQuote(invalidParams)).rejects.toThrow(
        'Invalid Solana receiver address: invalid-receiver-address'
      );
    });

    it('should handle API errors', async () => {
      const apiError = new Error('API Error');
      mockAxiosPost.mockRejectedValue(apiError);

      await expect(sdk.fetchQuote(validQuoteParams)).rejects.toThrow(
        'Failed to fetch GeniusBridge quote, error: API Error'
      );
      expect(mockedLogger.error).toHaveBeenCalledWith('Failed to fetch quote', apiError);
    });

    it('should transform native token addresses correctly', async () => {
      const nativeParams = {
        ...validQuoteParams,
        tokenIn: 'ETH',
        tokenOut: 'SOL'
      };

      await sdk.fetchQuote(nativeParams);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://bridge-api.tradegeniuses.net/quoting/quote',
        expect.objectContaining({
          tokenIn: NATIVE_ADDRESS,
          tokenOut: SOL_NATIVE_ADDRESS
        })
      );
    });
  });

  describe('Supported Chains', () => {
    it('should include all expected chains', () => {
      const expectedChains = [
        ChainIdEnum.ETHEREUM,
        ChainIdEnum.ARBITRUM,
        ChainIdEnum.OPTIMISM,
        ChainIdEnum.POLYGON,
        ChainIdEnum.BSC,
        ChainIdEnum.AVALANCHE,
        ChainIdEnum.BASE,
        ChainIdEnum.SOLANA,
        ChainIdEnum.SONIC
      ];

      expectedChains.forEach(chain => {
        expect(sdk.chains).toContain(chain);
      });
    });
  });

  describe('Address Validation', () => {
    it('should accept valid EVM addresses', async () => {
      const validEvmParams = {
        networkIn: ChainIdEnum.ETHEREUM,
        networkOut: ChainIdEnum.SOLANA,
        tokenIn: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        tokenOut: 'So11111111111111111111111111111111111111112',
        amountIn: '1000000000000000000',
        slippage: 0.5,
        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      mockAxiosPost.mockResolvedValue({ data: {} });
      await expect(sdk.fetchPrice(validEvmParams)).resolves.not.toThrow();
    });

    it('should accept valid Solana addresses', async () => {
      const validSolanaParams = {
        networkIn: ChainIdEnum.SOLANA,
        networkOut: ChainIdEnum.ETHEREUM,
        tokenIn: 'So11111111111111111111111111111111111111112',
        tokenOut: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amountIn: '1000000000000000000',
        slippage: 0.5,
        from: 'So11111111111111111111111111111111111111112'
      };

      mockAxiosPost.mockResolvedValue({ data: {} });
      await expect(sdk.fetchPrice(validSolanaParams)).resolves.not.toThrow();
    });
  });
}); 