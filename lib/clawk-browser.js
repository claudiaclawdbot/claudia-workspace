/**
 * Clawk Browser Automation Library
 * Shared Playwright utilities for Clawk (agent Twitter) automation
 * 
 * @module clawk-browser
 * @version 1.0.0
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Default configuration
const DEFAULT_CONFIG = {
  headless: true,
  viewport: { width: 1280, height: 720 },
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0'
};

/**
 * Execute function with managed browser lifecycle
 * @param {Function} callback - Async function receiving browser instance
 * @param {Object} options - Browser launch options
 * @returns {*} Callback result
 */
async function withBrowser(callback, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  let browser = null;
  
  try {
    browser = await chromium.launch({
      headless: config.headless
    });
    
    const result = await callback(browser);
    return result;
  } finally {
    if (browser) {
      await safeClose(browser);
    }
  }
}

/**
 * Execute function with a page navigated to URL
 * @param {string} url - URL to navigate to
 * @param {Function} callback - Async function receiving page instance
 * @param {Object} options - Browser and context options
 * @returns {*} Callback result
 */
async function withPage(url, callback, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  
  return withBrowser(async (browser) => {
    const context = await browser.newContext({
      viewport: config.viewport,
      userAgent: config.userAgent
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(config.timeout);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      const result = await callback(page);
      return result;
    } finally {
      await context.close();
    }
  }, config);
}

/**
 * Safely close browser with error handling
 * @param {Object} browser - Playwright browser instance
 */
async function safeClose(browser) {
  try {
    await browser.close();
  } catch (err) {
    console.warn('[clawk-browser] Error closing browser:', err.message);
  }
}

/**
 * Capture screenshot with automatic directory creation
 * @param {Object} page - Playwright page instance
 * @param {string} filename - Screenshot filename
 * @param {string} dir - Screenshot directory
 * @returns {string} Full path to screenshot
 */
async function captureScreenshot(page, filename, dir = './screenshots') {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filepath = path.join(dir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

/**
 * Wait for element with retry logic
 * @param {Object} page - Playwright page instance
 * @param {string} selector - CSS or XPath selector
 * @param {Object} options - Wait options
 * @returns {Object} Element handle
 */
async function waitForElement(page, selector, options = {}) {
  const { timeout = 10000, visible = true } = options;
  
  try {
    return await page.waitForSelector(selector, {
      timeout,
      visible
    });
  } catch (err) {
    throw new Error(`Element not found: ${selector} (${err.message})`);
  }
}

/**
 * Type text with human-like delay
 * @param {Object} page - Playwright page instance
 * @param {string} selector - Input selector
 * @param {string} text - Text to type
 * @param {number} delay - Delay between keystrokes (ms)
 */
async function typeHumanLike(page, selector, text, delay = 50) {
  await page.fill(selector, ''); // Clear first
  await page.type(selector, text, { delay });
}

/**
 * Check if element exists on page
 * @param {Object} page - Playwright page instance
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
async function elementExists(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get text content from selector
 * @param {Object} page - Playwright page instance
 * @param {string} selector - CSS selector
 * @returns {string|null}
 */
async function getText(page, selector) {
  try {
    const element = await page.$(selector);
    if (element) {
      return await element.textContent();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Scroll page to element
 * @param {Object} page - Playwright page instance
 * @param {string} selector - CSS selector
 */
async function scrollToElement(page, selector) {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, selector);
}

/**
 * Extract all links from page
 * @param {Object} page - Playwright page instance
 * @returns {Array<{text: string, href: string}>}
 */
async function extractLinks(page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => ({
        text: a.textContent.trim(),
        href: a.href
      }))
      .filter(link => link.href && !link.href.startsWith('javascript:'));
  });
}

/**
 * Load cookies from file
 * @param {Object} context - Playwright browser context
 * @param {string} filepath - Path to cookies JSON file
 */
async function loadCookies(context, filepath) {
  if (fs.existsSync(filepath)) {
    const cookies = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    await context.addCookies(cookies);
  }
}

/**
 * Save cookies to file
 * @param {Object} context - Playwright browser context
 * @param {string} filepath - Path to save cookies
 */
async function saveCookies(context, filepath) {
  const cookies = await context.cookies();
  fs.writeFileSync(filepath, JSON.stringify(cookies, null, 2));
}

// Export all utilities
module.exports = {
  withBrowser,
  withPage,
  safeClose,
  captureScreenshot,
  waitForElement,
  typeHumanLike,
  elementExists,
  getText,
  scrollToElement,
  extractLinks,
  loadCookies,
  saveCookies,
  DEFAULT_CONFIG
};

// CLI usage example
if (require.main === module) {
  console.log(`
Clawk Browser Automation Library
================================

Usage:
  const { withPage, captureScreenshot } = require('./lib/clawk-browser');

  (async () => {
    const result = await withPage('https://example.com', async (page) => {
      await page.click('button');
      await captureScreenshot(page, 'result.png');
      return await page.title();
    });
    console.log('Page title:', result);
  })();

Available functions:
- withBrowser(callback, options) - Manage browser lifecycle
- withPage(url, callback, options) - Navigate and execute
- safeClose(browser) - Safe browser cleanup
- captureScreenshot(page, filename) - Take screenshots
- waitForElement(page, selector) - Wait with retry
- typeHumanLike(page, selector, text) - Human-like typing
- elementExists(page, selector) - Check existence
- getText(page, selector) - Extract text
- scrollToElement(page, selector) - Scroll to element
- extractLinks(page) - Get all links
- loadCookies(context, filepath) - Load session cookies
- saveCookies(context, filepath) - Save session cookies

Contact: claudiaclawdbot@gmail.com
`);
}
