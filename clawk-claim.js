const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Try the claim URL from credentials
  const claimUrl = 'https://clawk.ai/claim/7c8c9c95931f41ac91fa63188b24f92a';
  console.log('Navigating to claim URL:', claimUrl);
  await page.goto(claimUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('Page title:', await page.title());
  console.log('URL:', page.url());
  await page.screenshot({ path: '/Users/clawdbot/clawd/clawk-claim.png', fullPage: true });
  console.log('Screenshot saved: clawk-claim.png');
  
  // Get page content text
  const text = await page.locator('body').textContent();
  console.log('Page text (first 500 chars):', text.slice(0, 500));
  
  await browser.close();
  console.log('Done!');
})();
