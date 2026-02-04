# Changelog

All notable changes to the x402 CLI will be documented in this file.

## [1.0.0] - 2026-02-02

### Added
- Initial release of x402 CLI
- Wallet management (create, import, balance check)
- Service discovery with search and filtering
- Payment execution for x402 endpoints
- Built-in services: Research ($0.10) and Crypto Prices ($0.01-$0.05)
- Usage tracking and history
- Support for Base and Base Sepolia networks
- Configuration management
- Full TypeScript support

### Commands
- `x402 wallet setup` - Create or import wallet
- `x402 wallet balance` - Check ETH and USDC balance
- `x402 wallet address` - Show wallet address
- `x402 services` - List available x402 services
- `x402 service <id>` - Get service details
- `x402 research <topic>` - Pay for research report
- `x402 price <coin>` - Get crypto price
- `x402 prices <coins>` - Get multiple crypto prices
- `x402 pay <url>` - Pay any x402 endpoint
- `x402 usage` - Show payment history
- `x402 config` - Show configuration
- `x402 set-directory <url>` - Set custom directory URL
- `x402 reset` - Reset all configuration

### Documentation
- Comprehensive README with quick start guide
- Full API documentation
- Contributing guidelines
- MIT License

---

## Future Releases

### [1.1.0] - Planned
- Batch payments for multiple services
- Service ratings and reviews
- Export usage data to CSV
- Web dashboard integration

### [1.2.0] - Planned
- Subscription support for recurring payments
- Advanced wallet management (multiple wallets)
- Custom RPC endpoint configuration
- Plugin system for custom commands

### [2.0.0] - Planned
- Mainnet USDC support as default
- Expanded service marketplace
- Analytics and reporting
- Multi-chain support
