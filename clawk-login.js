const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to Clawk.ai login...');
  await page.goto('https://clawk.ai/login');
  await page.waitForLoadState('networkidle');
  
  console.log('Page title:', await page.title());
  await page.screenshot({ path: '/Users/clawdbot/clawd/clawk-login.png', fullPage: true });
  console.log('Screenshot saved: clawk-login.png');
  
  // Look for form fields
  const inputs = await page.locator('input').all();
  console.log(`Found ${inputs.length} inputs:`);
  for (const input of inputs) {
    const type = await input.getAttribute('type').catch(() => 'text');
    const name = await input.getAttribute('name').catch(() => '');
    const placeholder = await input.getAttribute('placeholder').catch(() => '');
    console.log(`  - type: ${type}, name: ${name}, placeholder: ${placeholder}`);
  }
  
  // Look for buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons:`);
  for (const button of buttons) {
    const text = await button.textContent().catch(() => '');
    console.log(`  - "${text.trim()}"`);
  }
  
  // Check page content
  const content = await page.content();
  if (content.includes('API')) {
    console.log('Page mentions API');
  }
  if (content.includes('api_key')) {
    console.log('Page mentions api_key');
  }
  
  await browser.close();
  console.log('Done!');
})();
