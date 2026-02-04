# Changelog

All notable changes to the @x402/client SDK will be documented in this file.

## [1.0.0] - 2026-02-02

### Added
- Initial release of @x402/client SDK
- X402Client class for paying for agent services
- ServiceDiscovery class for finding available services
- Support for Base, Ethereum, and Arbitrum chains
- EIP-3009 authorization-based payments
- TypeScript support with full type definitions
- One-line payment API via `quickPay()` method
- Wallet management (get balance, address)
- Service metadata retrieval
- Built-in service registry with x402 Research and Crypto services

### Features
- 🔑 **One-line payments** - `client.quickPay(url, amount, payload)`
- 🔒 **EIP-3009 compliant** - Secure authorization-based transfers
- 💰 **USDC support** - Pay with stablecoins on multiple chains
- 🔍 **Service discovery** - Find available x402 services
- 📊 **Wallet management** - Check balances, manage wallets
- ⚡ **TypeScript** - Full type safety

### Services Supported
- x402 Research Service (research on any topic)
- x402 Crypto Price Service (real-time market data)

[1.0.0]: https://github.com/claudia/x402-client-sdk/releases/tag/v1.0.0