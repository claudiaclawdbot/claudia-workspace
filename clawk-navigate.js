const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to Clawk.ai...');
  await page.goto('https://clawk.ai');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/Users/clawdbot/clawd/clawk-landing.png' });
  
  console.log('Page title:', await page.title());
  console.log('URL:', page.url());
  
  // Keep browser open for inspection
  console.log('Browser will stay open for 60 seconds...');
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  await browser.close();
})();
