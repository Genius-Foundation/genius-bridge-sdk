#!/bin/bash

# GeniusBridge SDK E2E Test Runner
# This script provides convenient ways to run e2e tests with different configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEBUG=false
API_URL=""
TEST_PATTERN=""
TIMEOUT=60000

# Function to print usage
print_usage() {
    echo -e "${BLUE}GeniusBridge SDK E2E Test Runner${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --debug           Enable debug mode"
    echo "  -u, --url URL         Set custom API URL"
    echo "  -p, --pattern PATTERN Run tests matching pattern"
    echo "  -t, --timeout MS      Set test timeout in milliseconds (default: 60000)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run all e2e tests"
    echo "  $0 --debug                           # Run with debug output"
    echo "  $0 --url https://api.example.com     # Run with custom API URL"
    echo "  $0 --pattern 'Ethereum'              # Run only Ethereum tests"
    echo "  $0 --pattern 'Price' --debug         # Run price tests with debug"
    echo ""
}

# Function to run tests
run_tests() {
    local env_vars=""
    
    if [ "$DEBUG" = true ]; then
        env_vars="$env_vars DEBUG=true"
        echo -e "${YELLOW}Debug mode enabled${NC}"
    fi
    
    if [ -n "$API_URL" ]; then
        env_vars="$env_vars GENIUS_BRIDGE_BASE_URL=$API_URL"
        echo -e "${YELLOW}Using custom API URL: $API_URL${NC}"
    fi
    
    if [ -n "$TEST_PATTERN" ]; then
        echo -e "${YELLOW}Running tests matching pattern: $TEST_PATTERN${NC}"
        eval "$env_vars npm test -- tests/e2e --testNamePattern='$TEST_PATTERN' --testTimeout=$TIMEOUT"
    else
        echo -e "${YELLOW}Running all e2e tests${NC}"
        eval "$env_vars npm test -- tests/e2e --testTimeout=$TIMEOUT"
    fi
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        echo -e "${RED}Error: Node.js 18+ is required (found version $node_version)${NC}"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}Error: package.json not found. Run this script from the project root.${NC}"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}Prerequisites check passed${NC}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--debug)
            DEBUG=true
            shift
            ;;
        -u|--url)
            API_URL="$2"
            shift 2
            ;;
        -p|--pattern)
            TEST_PATTERN="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
echo -e "${BLUE}=== GeniusBridge SDK E2E Test Runner ===${NC}"
echo ""

check_prerequisites

echo ""
echo -e "${BLUE}Test Configuration:${NC}"
echo "  Debug: $DEBUG"
echo "  API URL: ${API_URL:-"Default"}"
echo "  Test Pattern: ${TEST_PATTERN:-"All tests"}"
echo "  Timeout: ${TIMEOUT}ms"
echo ""

# Run the tests
echo -e "${BLUE}Starting tests...${NC}"
echo ""

if run_tests; then
    echo ""
    echo -e "${GREEN}✅ All tests completed successfully!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi 