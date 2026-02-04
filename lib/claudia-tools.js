/**
 * Claudia Tools Shared Library
 * Common utilities for all CLI tools
 * 
 * @module claudia-tools
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONSTANTS
// ============================================================================

const CONSTANTS = {
  CONTACT_EMAIL: 'claudiaclawdbot@gmail.com',
  GITHUB_URL: 'https://github.com/claudiaclawdbot',
  CLAWK_HANDLE: '@claudiaclawd',
  
  PRICES: {
    'readme-gen': 15,
    'changelog-gen': 15,
    'commit-msg-gen': 10,
    'code-review-assistant': 20,
    'standup-reporter': 10,
    'repo-analyzer': 15,
    'api-client-gen': 25,
    'customer-acquisition': 35,
    'email-assistant': 15,
    'showcase-gen': 20,
    'price-estimator': 20,
    'deploy-pack': 15,
    'quick-stats': 5,
    'music-gen-research': 10
  },
  
  DISCOUNTS: {
    BULK_5: 0.10,   // 10% off for 5+ tools
    BULK_10: 0.20,  // 20% off for 10+ tools
    RETAINER: 0.25  // 25% off for ongoing work
  }
};

// ============================================================================
// CLI UTILITIES
// ============================================================================

const CLI = {
  /**
   * Parse command line arguments
   * @param {string[]} args - process.argv.slice(2)
   * @returns {Object} Parsed arguments
   */
  parseArgs(args) {
    const result = { _: [] };
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];
        
        if (nextArg && !nextArg.startsWith('-')) {
          result[key] = nextArg;
          i++;
        } else {
          result[key] = true;
        }
      } else if (arg.startsWith('-')) {
        const key = arg.slice(1);
        const nextArg = args[i + 1];
        
        if (nextArg && !nextArg.startsWith('-')) {
          result[key] = nextArg;
          i++;
        } else {
          result[key] = true;
        }
      } else {
        result._.push(arg);
      }
    }
    
    return result;
  },

  /**
   * Show help message for a tool
   * @param {string} toolName - Name of the tool
   * @param {string} description - Tool description
   * @param {Object} options - Available options
   */
  showHelp(toolName, description, options = {}) {
    console.log(`
${toolName}
${'='.repeat(toolName.length)}

${description}

Usage:
  ${toolName} [options] <arguments>

Options:`);

    Object.entries(options).forEach(([flag, desc]) => {
      console.log(`  ${flag.padEnd(20)} ${desc}`);
    });

    console.log(`
  --help, -h           Show this help message
  --version, -v        Show version

Examples:
  ${toolName} --example value

Contact: ${CONSTANTS.CONTACT_EMAIL}
`);
  },

  /**
   * Confirm action with user
   * @param {string} message - Confirmation message
   * @returns {Promise<boolean>}
   */
  async confirm(message) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }
};

// ============================================================================
// FILE I/O UTILITIES
// ============================================================================

const IO = {
  /**
   * Read JSON file safely
   * @param {string} filepath - Path to JSON file
   * @param {*} defaultValue - Default if file doesn't exist
   * @returns {*} Parsed JSON or default
   */
  readJSON(filepath, defaultValue = null) {
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return defaultValue;
      }
      throw err;
    }
  },

  /**
   * Write JSON file with formatting
   * @param {string} filepath - Path to write
   * @param {*} data - Data to write
   * @param {number} spaces - Indentation spaces
   */
  writeJSON(filepath, data, spaces = 2) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filepath, JSON.stringify(data, null, spaces));
  },

  /**
   * Safely read file with default
   * @param {string} filepath - Path to file
   * @param {string} defaultValue - Default content
   * @returns {string} File content or default
   */
  safeRead(filepath, defaultValue = '') {
    try {
      return fs.readFileSync(filepath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return defaultValue;
      }
      throw err;
    }
  },

  /**
   * Check if file exists
   * @param {string} filepath - Path to check
   * @returns {boolean}
   */
  exists(filepath) {
    try {
      fs.accessSync(filepath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Ensure directory exists
   * @param {string} dirpath - Directory path
   */
  ensureDir(dirpath) {
    if (!fs.existsSync(dirpath)) {
      fs.mkdirSync(dirpath, { recursive: true });
    }
  }
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

const FORMAT = {
  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string}
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  /**
   * Format date
   * @param {Date|string} date - Date to format
   * @param {string} format - Format style ('short', 'long', 'iso')
   * @returns {string}
   */
  formatDate(date, format = 'short') {
    const d = new Date(date);
    
    switch (format) {
      case 'iso':
        return d.toISOString().split('T')[0];
      case 'long':
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'short':
      default:
        return d.toLocaleDateString('en-US');
    }
  },

  /**
   * Format relative time
   * @param {Date|string} date - Date to compare
   * @returns {string}
   */
  timeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  },

  /**
   * Create markdown table from data
   * @param {string[]} headers - Column headers
   * @param {Array<Array>} rows - Table rows
   * @returns {string}
   */
  markdownTable(headers, rows) {
    const lines = [
      '| ' + headers.join(' | ') + ' |',
      '|' + headers.map(() => '---').join('|') + '|'
    ];
    
    rows.forEach(row => {
      lines.push('| ' + row.join(' | ') + ' |');
    });
    
    return lines.join('\n');
  }
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const LOG = {
  /**
   * Info log
   * @param {...*} args
   */
  info(...args) {
    console.log('\x1b[34m[INFO]\x1b[0m', ...args);
  },

  /**
   * Success log
   * @param {...*} args
   */
  success(...args) {
    console.log('\x1b[32m[OK]\x1b[0m', ...args);
  },

  /**
   * Warning log
   * @param {...*} args
   */
  warn(...args) {
    console.log('\x1b[33m[WARN]\x1b[0m', ...args);
  },

  /**
   * Error log
   * @param {...*} args
   */
  error(...args) {
    console.error('\x1b[31m[ERROR]\x1b[0m', ...args);
  },

  /**
   * Debug log (only with DEBUG env)
   * @param {...*} args
   */
  debug(...args) {
    if (process.env.DEBUG) {
      console.log('\x1b[90m[DEBUG]\x1b[0m', ...args);
    }
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  CONSTANTS,
  CLI,
  IO,
  FORMAT,
  LOG
};

// If run directly, show help
if (require.main === module) {
  console.log(`
Claudia Tools Shared Library
============================

This module provides common utilities for all CLI tools.

Usage in your tool:
  const { CLI, IO, FORMAT, LOG, CONSTANTS } = require('../lib/claudia-tools');

Available utilities:
- CLI: parseArgs, showHelp, confirm
- IO: readJSON, writeJSON, safeRead, exists, ensureDir
- FORMAT: formatCurrency, formatDate, timeAgo, markdownTable
- LOG: info, success, warn, error, debug
- CONSTANTS: CONTACT_EMAIL, GITHUB_URL, PRICES, DISCOUNTS

Contact: ${CONSTANTS.CONTACT_EMAIL}
`);
}
