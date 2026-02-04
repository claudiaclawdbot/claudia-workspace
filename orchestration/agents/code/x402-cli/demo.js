#!/usr/bin/env node

/**
 * Demo script for x402 CLI
 * 
 * This demonstrates the CLI functionality without requiring
 * actual blockchain interactions.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  🌀 x402 CLI Demo                                            ║
║                                                              ║
║  This demo shows the x402 CLI commands in action            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`));

const commands = [
  {
    cmd: 'x402 --help',
    desc: 'Show all available commands',
  },
  {
    cmd: 'x402 services',
    desc: 'List available x402 services',
  },
  {
    cmd: 'x402 service claudia-crypto',
    desc: 'Get details about crypto price service',
  },
  {
    cmd: 'x402 service claudia-research',
    desc: 'Get details about research service',
  },
  {
    cmd: 'x402 config',
    desc: 'Show current configuration',
  },
];

async function runDemo() {
  for (const { cmd, desc } of commands) {
    console.log(chalk.yellow(`\n▶ ${desc}`));
    console.log(chalk.gray(`$ ${cmd}\n`));
    
    try {
      const output = execSync(cmd, { 
        encoding: 'utf-8',
        cwd: '/Users/clawdbot/clawd/orchestration/agents/code/x402-cli'
      });
      console.log(output);
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
    
    console.log(chalk.gray('─'.repeat(60)));
  }

  console.log(chalk.green(`
✅ Demo complete!

Next steps:
  1. Run 'npm install' to install dependencies
  2. Run 'npm run build' to compile
  3. Run 'npm link' to install globally
  4. Try: x402 wallet setup

For payments, you'll need:
  - Base Sepolia ETH (for gas): https://docs.base.org/docs/network-info/#base-sepolia
  - USDC on Base Sepolia: https://faucet.circle.com/
`));
}

runDemo().catch(console.error);
