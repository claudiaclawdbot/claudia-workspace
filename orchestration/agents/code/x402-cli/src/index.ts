#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { 
  getConfig, 
  setWalletConfig, 
  generateNewWallet, 
  importWallet, 
  hasWallet,
  clearConfig,
  getConfigPath,
  setDirectoryUrl,
  setDefaultNetwork,
} from './config.js';
import { 
  getBalance, 
  getExplorerUrl, 
  getAddress, 
  getNetwork 
} from './wallet.js';
import { 
  listServices, 
  getService, 
  formatPrice,
  getCategories 
} from './directory.js';
import { 
  executePayment,
  payForResearch,
  payForCryptoPrice,
  payForCryptoPrices,
  payForAllCryptoPrices,
  getUsageHistory,
  formatTxHash,
} from './payment.js';

const program = new Command();

program
  .name('x402')
  .description('CLI for discovering and paying for x402-enabled services')
  .version('1.0.0');

// Wallet commands
const walletCmd = program
  .command('wallet')
  .description('Wallet management');

walletCmd
  .command('setup')
  .description('Set up or import a wallet')
  .action(async () => {
    console.log(chalk.blue('🔐 x402 Wallet Setup\n'));

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Create a new wallet', value: 'create' },
        { name: 'Import existing wallet', value: 'import' },
      ],
    }]);

    if (action === 'create') {
      const spinner = ora('Generating new wallet...').start();
      const { privateKey, address } = generateNewWallet();
      spinner.succeed('Wallet generated!');

      console.log(chalk.green(`\n✅ Address: ${address}`));
      console.log(chalk.yellow(`\n🔑 Private Key: ${privateKey}`));
      console.log(chalk.red('\n⚠️  IMPORTANT: Save your private key securely!'));
      console.log(chalk.gray('   It will not be shown again.\n'));

      const { network } = await inquirer.prompt([{
        type: 'list',
        name: 'network',
        message: 'Select network:',
        choices: [
          { name: 'Base Sepolia (Testnet)', value: 'base-sepolia' },
          { name: 'Base (Mainnet)', value: 'base' },
        ],
        default: 'base-sepolia',
      }]);

      setWalletConfig({ privateKey, address, network });
      setDefaultNetwork(network);

      console.log(chalk.green('\n✅ Wallet configured!'));
      console.log(chalk.blue(`   Network: ${network}`));
      console.log(chalk.gray(`   Config saved to: ${getConfigPath()}`));
      
      if (network === 'base-sepolia') {
        console.log(chalk.cyan('\n💡 Get testnet ETH from: https://docs.base.org/docs/network-info/#base-sepolia'));
      }
    } else {
      const { privateKey } = await inquirer.prompt([{
        type: 'password',
        name: 'privateKey',
        message: 'Enter your private key (0x...):',
        mask: '*',
      }]);

      try {
        const { address } = importWallet(privateKey);
        console.log(chalk.green(`\n✅ Address: ${address}`));

        const { network } = await inquirer.prompt([{
          type: 'list',
          name: 'network',
          message: 'Select network:',
          choices: [
            { name: 'Base Sepolia (Testnet)', value: 'base-sepolia' },
            { name: 'Base (Mainnet)', value: 'base' },
          ],
          default: 'base-sepolia',
        }]);

        setWalletConfig({ privateKey, address, network });
        setDefaultNetwork(network);

        console.log(chalk.green('\n✅ Wallet imported successfully!'));
      } catch (error) {
        console.error(chalk.red('\n❌ Invalid private key'));
        process.exit(1);
      }
    }
  });

walletCmd
  .command('balance')
  .description('Check wallet balance')
  .option('-n, --network <network>', 'Network (base, base-sepolia)')
  .action(async (options) => {
    try {
      if (!hasWallet()) {
        console.error(chalk.red('❌ No wallet configured. Run: x402 wallet setup'));
        process.exit(1);
      }

      const address = getAddress();
      const spinner = ora('Fetching balance...').start();
      
      const balance = await getBalance(address, options.network);
      spinner.stop();

      console.log(chalk.blue('💰 Wallet Balance\n'));
      console.log(`Address: ${chalk.cyan(address)}`);
      console.log(`Network: ${chalk.yellow(balance.network)}`);
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`ETH:  ${chalk.green(balance.eth.padStart(12))}`);
      console.log(`USDC: ${chalk.green(balance.usdc.padStart(12))}`);
      console.log(chalk.gray('─'.repeat(50)));
      
      if (Number(balance.eth) < 0.001) {
        console.log(chalk.yellow('\n⚠️  Low ETH balance. You need ETH for gas fees.'));
      }
      if (Number(balance.usdc) < 1) {
        console.log(chalk.yellow('\n💡 Tip: You need USDC to pay for x402 services.'));
      }
    } catch (error) {
      console.error(chalk.red(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

walletCmd
  .command('address')
  .description('Show wallet address')
  .action(() => {
    if (!hasWallet()) {
      console.error(chalk.red('❌ No wallet configured. Run: x402 wallet setup'));
      process.exit(1);
    }
    console.log(getAddress());
  });

// Service discovery commands
program
  .command('services')
  .description('List available x402 services')
  .option('-c, --category <category>', 'Filter by category')
  .option('-f, --featured', 'Show only featured services')
  .option('-s, --search <query>', 'Search services')
  .action(async (options) => {
    try {
      const spinner = ora('Discovering services...').start();
      const services = await listServices(options);
      spinner.stop();

      if (services.length === 0) {
        console.log(chalk.yellow('No services found.'));
        return;
      }

      console.log(chalk.blue(`📡 Available Services (${services.length})\n`));

      for (const service of services) {
        const featured = service.featured ? chalk.yellow(' ⭐') : '';
        console.log(`${chalk.green(service.name)}${featured}`);
        console.log(chalk.gray(service.id));
        console.log(service.description);
        console.log(chalk.cyan(`Price: ${formatPrice(service)}`));
        console.log(chalk.gray(`Tags: ${service.tags.join(', ')}`));
        console.log(chalk.gray('─'.repeat(50)));
      }

      console.log(chalk.blue('\n💡 Use "x402 service <id>" for details'));
    } catch (error) {
      console.error(chalk.red(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('service <id>')
  .description('Get details about a specific service')
  .action(async (id) => {
    try {
      const spinner = ora('Fetching service details...').start();
      const service = await getService(id);
      spinner.stop();

      if (!service) {
        console.error(chalk.red(`❌ Service "${id}" not found`));
        console.log(chalk.blue('\n💡 Run "x402 services" to see available services'));
        process.exit(1);
      }

      console.log(chalk.blue(`📡 ${service.name}\n`));
      console.log(service.description);
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`ID:       ${service.id}`);
      console.log(`Category: ${service.category}`);
      console.log(`Price:    ${chalk.cyan(formatPrice(service))}`);
      console.log(`URL:      ${chalk.underline(service.url)}`);
      console.log(`Tags:     ${service.tags.join(', ')}`);
      
      if (service.endpoints?.length) {
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.yellow('Endpoints:'));
        for (const ep of service.endpoints) {
          const price = ep.price ? chalk.cyan(`(${ep.price})`) : '';
          console.log(`  ${ep.method.padEnd(6)} ${ep.path.padEnd(20)} ${ep.description} ${price}`);
        }
      }

      console.log(chalk.blue('\n💡 Quick pay commands:'));
      if (id === 'claudia-research') {
        console.log(chalk.gray(`  x402 research "your topic here"`));
      } else if (id === 'claudia-crypto') {
        console.log(chalk.gray(`  x402 price bitcoin`));
        console.log(chalk.gray(`  x402 prices bitcoin,ethereum,solana`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Quick payment commands
program
  .command('research <topic>')
  .description('Pay for a research report on any topic')
  .action(async (topic) => {
    try {
      if (!hasWallet()) {
        console.error(chalk.red('❌ No wallet configured. Run: x402 wallet setup'));
        process.exit(1);
      }

      console.log(chalk.blue('🔍 Research Request\n'));
      console.log(`Topic: ${topic}`);
      console.log(`Price: ${chalk.cyan('$0.10 USDC')}`);
      console.log(chalk.gray('─'.repeat(50)));

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with payment?',
        default: true,
      }]);

      if (!confirm) {
        console.log(chalk.yellow('Payment cancelled'));
        return;
      }

      const spinner = ora('Processing payment and generating report...').start();
      const result = await payForResearch(topic);
      spinner.succeed('Report generated!');

      console.log(chalk.green('\n✅ Payment Successful'));
      console.log(`TX Hash: ${chalk.gray(formatTxHash(result.receipt.txHash))}`);
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.yellow('\n📄 Research Report:\n'));
      console.log(result.serviceResponse);
    } catch (error) {
      console.error(chalk.red(`\n❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('price <coin>')
  .description('Get cryptocurrency price (pay-per-query)')
  .action(async (coin) => {
    try {
      if (!hasWallet()) {
        console.error(chalk.red('❌ No wallet configured. Run: x402 wallet setup'));
        process.exit(1);
      }

      console.log(chalk.blue('💰 Crypto Price\n'));
      console.log(`Coin: ${coin}`);
      console.log(`Price: ${chalk.cyan('$0.01 USDC')}`);
      console.log(chalk.gray('─'.repeat(50)));

      const spinner = ora('Fetching price...').start();
      const result = await payForCryptoPrice(coin.toLowerCase());
      spinner.succeed('Price retrieved!');

      console.log(chalk.green('\n✅ Payment Successful'));
      console.log(`TX Hash: ${chalk.gray(formatTxHash(result.receipt.txHash))}`);
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.yellow('\n📊 Price Data:'));
      console.log(result.serviceResponse);
    } catch (error) {
      console.error(chalk.red(`\n❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('prices <coins>')
  .description('Get multiple crypto prices (comma-separated)')
  .action(async (coins) => {
    try {
      if (!hasWallet()) {
        console.error(chalk.red('❌ No wallet configured. Run: x402 wallet setup'));
        process.exit(1);
      }

      const coinList = coins.split(',').map((c: string) => c.trim().toLowerCase());
      
      console.log(chalk.blue('💰 Crypto Prices\n'));
      console.log(`Coins: ${coinList.join(', ')}`);
      console.log(`Price: ${chalk.cyan('$0.05 USDC')}`);
      console.log(chalk.gray('─'.repeat(50)));

      const spinner = ora('Fetching prices...').start();
      const result = await payForCryptoPrices(coinList);
      spinner.succeed('Prices retrieved!');

      console.log(chalk.green('\n✅ Payment Successful'));
      console.log(`TX Hash: ${chalk.gray(formatTxHash(result.receipt.txHash))}`);
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.yellow('\n📊 Price Data:'));
      console.log(result.serviceResponse);
    } catch (error) {
      console.error(chalk.red(`\n❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('pay <url>')
  .description('Pay for any x402-enabled endpoint')
  .option('-m, --method <method>', 'HTTP method', 'GET')
  .option('-d, --data <data>', 'JSON body for POST requests')
  .action(async (url, options) => {
    try {
      if (!hasWallet()) {
        console.error(chalk.red('❌ No wallet configured. Run: x402 wallet setup'));
        process.exit(1);
      }

      console.log(chalk.blue('💳 x402 Payment\n'));
      console.log(`URL:    ${url}`);
      console.log(`Method: ${options.method}`);
      if (options.data) {
        console.log(`Body:   ${options.data}`);
      }
      console.log(chalk.gray('─'.repeat(50)));

      const body = options.data ? JSON.parse(options.data) : undefined;
      
      const spinner = ora('Processing...').start();
      const result = await executePayment(url, options.method, body);
      spinner.succeed('Complete!');

      console.log(chalk.green('\n✅ Payment Successful'));
      console.log(`TX Hash: ${chalk.gray(formatTxHash(result.receipt.txHash))}`);
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.yellow('\n📄 Response:'));
      console.log(result.serviceResponse);
    } catch (error) {
      console.error(chalk.red(`\n❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Usage tracking
program
  .command('usage')
  .description('Show payment usage history')
  .option('-l, --limit <n>', 'Limit number of records', '20')
  .action(async (options) => {
    try {
      const history = await getUsageHistory();
      const limit = parseInt(options.limit);
      const recent = history.slice(-limit).reverse();

      if (recent.length === 0) {
        console.log(chalk.yellow('No usage history found.'));
        return;
      }

      console.log(chalk.blue(`📊 Usage History (Last ${recent.length})\n`));

      let totalSpent = 0;
      const USDC_DECIMALS = 6;

      for (const entry of recent) {
        const amount = Number(entry.amount) / Math.pow(10, USDC_DECIMALS);
        const status = entry.status === 'success' 
          ? chalk.green('✓') 
          : chalk.red('✗');
        
        console.log(`${status} ${entry.method} ${entry.endpoint.split('/').pop()}`);
        console.log(`   ${chalk.cyan(amount.toFixed(4))} USDC · ${chalk.gray(formatTxHash(entry.txHash))}`);
        console.log(`   ${chalk.gray(new Date(entry.timestamp).toLocaleString())}`);
        console.log();

        if (entry.status === 'success') {
          totalSpent += amount;
        }
      }

      console.log(chalk.gray('─'.repeat(50)));
      console.log(`Total Spent: ${chalk.cyan(totalSpent.toFixed(4))} USDC`);
    } catch (error) {
      console.error(chalk.red(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

// Config commands
program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    const config = getConfig();
    console.log(chalk.blue('⚙️  Configuration\n'));
    console.log(`Config file: ${chalk.gray(getConfigPath())}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`Directory URL: ${config.directoryUrl}`);
    console.log(`Default Network: ${config.defaultNetwork}`);
    console.log(`Wallet Address: ${config.wallet.address ? chalk.cyan(config.wallet.address) : chalk.red('Not set')}`);
    console.log(`Network: ${config.wallet.network}`);
  });

program
  .command('set-directory <url>')
  .description('Set custom service directory URL')
  .action((url) => {
    setDirectoryUrl(url);
    console.log(chalk.green(`✅ Directory URL set to: ${url}`));
  });

program
  .command('reset')
  .description('Reset all configuration')
  .action(async () => {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.red('This will delete all configuration. Are you sure?'),
      default: false,
    }]);

    if (confirm) {
      clearConfig();
      console.log(chalk.green('✅ Configuration reset'));
    } else {
      console.log(chalk.yellow('Cancelled'));
    }
  });

// Helpful info on startup
program.on('--help', () => {
  console.log('');
  console.log(chalk.blue('Examples:'));
  console.log('');
  console.log(chalk.gray('  $ x402 wallet setup'));
  console.log(chalk.gray('  $ x402 wallet balance'));
  console.log(chalk.gray('  $ x402 services'));
  console.log(chalk.gray('  $ x402 service claudia-research'));
  console.log(chalk.gray('  $ x402 research "AI agent economy"'));
  console.log(chalk.gray('  $ x402 price bitcoin'));
  console.log(chalk.gray('  $ x402 prices bitcoin,ethereum,solana'));
  console.log('');
});

program.parse();

// Show welcome if no args
if (process.argv.length <= 2) {
  console.log(chalk.blue(`
╭─────────────────────────────────────────────────╮
│                                                 │
│  ${chalk.bold('x402 CLI')} - Agent-to-Agent Payments          │
│                                                 │
│  Discover and pay for x402-enabled services    │
│  with a single command.                         │
│                                                 │
╰─────────────────────────────────────────────────╯
`));
  console.log(chalk.gray('Quick start:'));
  console.log('  1. ' + chalk.cyan('x402 wallet setup') + chalk.gray('    - Set up your wallet'));
  console.log('  2. ' + chalk.cyan('x402 services') + chalk.gray('        - See available services'));
  console.log('  3. ' + chalk.cyan('x402 price bitcoin') + chalk.gray('   - Make your first payment'));
  console.log('');
  console.log(chalk.gray('Run "x402 --help" for all commands'));
  console.log('');
}
