import axios from 'axios';
import {
  GeniusBridgeConfig,
  GeniusBridgePriceParams,
  GeniusBridgePriceResponse,
  GeniusBridgeQuoteParams,
  GeniusBridgeQuoteResponse,
} from './genius-bridge.types';
import { ChainIdEnum } from './types/enums';
import { ILogger, LoggerFactory, LogLevelEnum } from './utils/logger';
import { isSolanaNetwork, isEVMNetwork } from './utils/check-vm';
import { validateSolanaAddress, validateAndChecksumEvmAddress } from './utils/address-validation';
import { NATIVE_ADDRESS } from './utils/constants';
import { isNative } from './utils/is-native';

let logger: ILogger;

export class GeniusBridgeSdk {
  public readonly chains = [
    ChainIdEnum.ETHEREUM,
    ChainIdEnum.ARBITRUM,
    ChainIdEnum.OPTIMISM,
    ChainIdEnum.POLYGON,
    ChainIdEnum.BSC,
    ChainIdEnum.AVALANCHE,
    ChainIdEnum.BASE,
    ChainIdEnum.SOLANA,
    // Add other supported chains
  ];
  public readonly baseUrl: string;
  protected readonly priceEndpoint: string;
  protected readonly quoteEndpoint: string;

  constructor(config?: GeniusBridgeConfig) {
    if (config?.debug) {
      LoggerFactory.configure(LoggerFactory.createConsoleLogger({ level: LogLevelEnum.DEBUG }));
    }
    // Use custom logger if provided
    else if (config?.logger) {
      LoggerFactory.configure(config.logger);
    }
    logger = LoggerFactory.getLogger();

    // Apply configuration with defaults
    this.baseUrl =
      config?.geniusBridgeBaseUrl ||
      'http://genius-bridge-staging-894762848.us-east-2.elb.amazonaws.com';
    this.priceEndpoint = '/quoting/price';
    this.quoteEndpoint = '/quoting/quote';
  }

  isCorrectConfig<T extends { [key: string]: string }>(_config: {
    [key: string]: string;
  }): _config is T {
    // GeniusBridge has no required config fields, all are optional
    return true;
  }

  public async fetchPrice(params: GeniusBridgePriceParams): Promise<GeniusBridgePriceResponse> {
    try {
      this.validatePriceParams(params);

      const priceEndpoint = `${this.baseUrl}${this.priceEndpoint}`;
      const response = await axios.post<GeniusBridgePriceResponse>(priceEndpoint, params);

      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch price`, error instanceof Error ? error : undefined);
      throw new Error(
        `Failed to fetch GeniusBridge price, error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  public async fetchQuote(params: GeniusBridgeQuoteParams): Promise<GeniusBridgeQuoteResponse> {
    try {
      this.validateQuoteParams(params);
      const transformedParams = this.transformQuoteParams(params);

      const quoteUri = `${this.baseUrl}${this.quoteEndpoint}`;
      const response = await axios.post<GeniusBridgeQuoteResponse>(quoteUri, transformedParams);

      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch quote`, error instanceof Error ? error : undefined);
      throw new Error(
        `Failed to fetch GeniusBridge quote, error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  protected validatePriceParams(params: GeniusBridgePriceParams): void {
    const { networkIn, networkOut, tokenIn, tokenOut, amountIn } = params;

    if (networkIn === networkOut) {
      logger.error('Single chain swaps are not supported by GeniusBridge');
      throw new Error('Single chain swaps are not supported by GeniusBridge');
    }

    if (!this.chains.includes(networkIn)) {
      logger.error(`Network ${networkIn} not supported by GeniusBridge`);
      throw new Error(`Network ${networkIn} not supported by GeniusBridge`);
    }

    if (!this.chains.includes(networkOut)) {
      logger.error(`Network ${networkOut} not supported by GeniusBridge`);
      throw new Error(`Network ${networkOut} not supported by GeniusBridge`);
    }

    if (amountIn === '0') {
      logger.error('Amount in must be greater than 0');
      throw new Error('Amount in must be greater than 0');
    }

    // Validate token addresses based on network type
    if (isSolanaNetwork(networkIn)) {
      try {
        validateSolanaAddress(tokenIn);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        logger.error(`Invalid Solana token address: ${tokenIn}`);
        throw new Error(`Invalid Solana token address: ${tokenIn}`);
      }
    } else if (isEVMNetwork(networkIn) && !isNative(tokenIn)) {
      try {
        validateAndChecksumEvmAddress(tokenIn);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        logger.error(`Invalid EVM token address: ${tokenIn}`);
        throw new Error(`Invalid EVM token address: ${tokenIn}`);
      }
    }

    if (isSolanaNetwork(networkOut)) {
      try {
        validateSolanaAddress(tokenOut);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        logger.error(`Invalid Solana token address: ${tokenOut}`);
        throw new Error(`Invalid Solana token address: ${tokenOut}`);
      }
    } else if (isEVMNetwork(networkOut) && !isNative(tokenOut)) {
      try {
        validateAndChecksumEvmAddress(tokenOut);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        logger.error(`Invalid EVM token address: ${tokenOut}`);
        throw new Error(`Invalid EVM token address: ${tokenOut}`);
      }
    }
  }

  protected validateQuoteParams(params: GeniusBridgeQuoteParams): void {
    this.validatePriceParams(params);

    if (!params.from) {
      logger.error('From address is required for quote');
      throw new Error('From address is required for quote');
    }

    // Verify 'to' address if provided
    if (params.to) {
      if (isSolanaNetwork(params.networkOut)) {
        try {
          validateSolanaAddress(params.to);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: unknown) {
          logger.error(`Invalid Solana receiver address: ${params.to}`);
          throw new Error(`Invalid Solana receiver address: ${params.to}`);
        }
      } else if (isEVMNetwork(params.networkOut)) {
        try {
          validateAndChecksumEvmAddress(params.to);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: unknown) {
          logger.error(`Invalid EVM receiver address: ${params.to}`);
          throw new Error(`Invalid EVM receiver address: ${params.to}`);
        }
      }
    }
  }

  protected transformPriceParams(params: GeniusBridgePriceParams): GeniusBridgePriceParams {
    let { networkIn, networkOut, tokenIn, tokenOut } = params;
    const { amountIn, slippage, from } = params;

    // Handle token address transformation
    if (isEVMNetwork(networkIn) && isNative(tokenIn)) {
      tokenIn = NATIVE_ADDRESS;
    }

    if (isEVMNetwork(networkOut) && isNative(tokenOut)) {
      tokenOut = NATIVE_ADDRESS;
    }

    return {
      networkIn,
      networkOut,
      tokenIn,
      tokenOut,
      amountIn,
      slippage,
      from,
    };
  }

  protected transformQuoteParams(params: GeniusBridgeQuoteParams): GeniusBridgeQuoteParams {
    const transformedPriceParams = this.transformPriceParams(params);

    return {
      ...transformedPriceParams,
      to: params.to || params.from,
      authority: {
        networkInAddress: params.from,
        networkOutAddress: params.to || params.from,
      },
    };
  }
}
