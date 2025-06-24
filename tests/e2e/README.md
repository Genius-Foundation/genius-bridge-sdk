# GeniusBridge SDK E2E Tests

This directory contains comprehensive end-to-end tests for the GeniusBridge SDK that verify prices and quotes across all supported chains.

## Test Structure

### Files

- `test-data.ts` - Contains test data including token addresses, test amounts, and test scenarios
- `genius-bridge.e2e.test.ts` - Main e2e tests covering cross-chain scenarios
- `chain-specific.e2e.test.ts` - Chain-specific tests and edge cases
- `README.md` - This documentation file

### Test Categories

#### 1. SDK Initialization Tests
- Verify SDK initializes correctly with default configuration
- Check all supported chains are available
- Validate base URL configuration

#### 2. Price Fetching Tests
- Test price fetching for all cross-chain combinations
- Verify different amounts and slippage values
- Validate response structure and data integrity
- Test concurrent requests and performance

#### 3. Quote Fetching Tests
- Test quote generation for all cross-chain combinations
- Verify execution payloads (EVM and Solana)
- Test with and without explicit "to" addresses
- Validate native token handling

#### 4. Error Handling Tests
- Test invalid parameters (same network, zero amounts, invalid addresses)
- Verify proper error messages
- Test edge cases and boundary conditions

#### 5. Chain-Specific Tests
- **Ethereum**: Tests from Ethereum to all other chains
- **Solana**: Tests from Solana to all EVM chains
- **Layer 2**: Tests for Arbitrum, Optimism, and Base
- **Alternative Chains**: Tests for Polygon, BSC, and Avalanche

#### 6. Edge Cases and Stress Tests
- Very small and large amounts
- Maximum slippage values
- Rapid successive requests
- Token pair specific tests (stablecoins, wrapped tokens)

## Supported Chains

The tests cover all chains supported by GeniusBridge:

- **Ethereum** (1)
- **Arbitrum** (42161)
- **Optimism** (10)
- **Polygon** (137)
- **BSC** (56)
- **Avalanche** (43114)
- **Base** (8453)
- **Solana** (1399811149)

## Supported Token Types

### EVM Chains
- **NATIVE**: Native tokens (ETH, MATIC, BNB, etc.)
- **USDC**: USD Coin
- **USDT**: Tether
- **WETH**: Wrapped Ether

### Solana
- **SOL**: Wrapped SOL
- **USDC**: USD Coin
- **USDT**: Tether
- **BONK**: Bonk token

## Test Scenarios

The tests cover 16 different cross-chain scenarios:

### EVM to EVM (8 scenarios)
- Ethereum ↔ Polygon, Arbitrum, BSC, Avalanche, Base, Optimism

### EVM to Solana (4 scenarios)
- Ethereum, Polygon, BSC, Avalanche → Solana

### Solana to EVM (4 scenarios)
- Solana → Ethereum, Polygon, BSC, Avalanche

## Running the Tests

### Prerequisites

1. Ensure you have Node.js 18+ installed
2. Install dependencies: `npm install`
3. Set up environment variables (optional):
   - `DEBUG=true` - Enable debug logging
   - `GENIUS_BRIDGE_BASE_URL` - Custom API endpoint

### Running All E2E Tests

```bash
npm run test:e2e
```

### Running Specific Test Files

```bash
# Run main e2e tests
npm test tests/e2e/genius-bridge.e2e.test.ts

# Run chain-specific tests
npm test tests/e2e/chain-specific.e2e.test.ts
```

### Running Tests with Debug Output

```bash
DEBUG=true npm run test:e2e
```

### Running Tests with Custom API Endpoint

```bash
GENIUS_BRIDGE_BASE_URL=https://your-api-endpoint.com npm run test:e2e
```

## Test Configuration

### Timeouts
- Individual tests: 30 seconds
- Concurrent tests: 60 seconds
- Global timeout: 60 seconds

### Test Data
- **Small amounts**: 1 USDC (1,000,000 wei)
- **Medium amounts**: 10 USDC (10,000,000 wei)
- **Large amounts**: 100 USDC (100,000,000 wei)
- **ETH amounts**: 1-5 ETH (18 decimals)

### Slippage Values
- **Low**: 0.1%
- **Medium**: 0.5%
- **High**: 1.0%
- **Maximum**: 10.0%

## Expected Test Results

### Successful Tests
- All price and quote requests should return valid responses
- Response amounts should be positive numbers
- Execution payloads should be properly formatted
- Error cases should throw appropriate exceptions

### Performance Expectations
- Individual requests: < 5 seconds
- Concurrent requests: < 30 seconds
- Price consistency: < 5% variance for identical requests

### Coverage
- All supported chain combinations
- All major token types
- Edge cases and error conditions
- Performance and reliability scenarios

## Troubleshooting

### Common Issues

1. **Network Timeouts**: Increase timeout values in jest.config.js
2. **Rate Limiting**: Tests use maxWorkers: 1 to prevent API rate limiting
3. **Invalid Token Addresses**: Update test-data.ts with correct addresses
4. **API Endpoint Issues**: Verify GENIUS_BRIDGE_BASE_URL is correct

### Debug Mode

Enable debug mode to see detailed logs:

```bash
DEBUG=true npm run test:e2e
```

### Skipping Tests

To skip specific test categories, use Jest's `describe.skip` or `test.skip`:

```typescript
describe.skip('Skipped Test Suite', () => {
  // Tests will be skipped
});
```

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add new test scenarios to `test-data.ts`
3. Update this README with new test categories
4. Ensure all tests have proper error handling
5. Add appropriate timeouts for network requests 