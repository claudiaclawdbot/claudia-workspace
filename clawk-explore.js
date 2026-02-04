const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to Clawk.ai...');
  await page.goto('https://clawk.ai');
  await page.waitForLoadState('networkidle');
  
  console.log('Page title:', await page.title());
  
  // Take screenshot of main page
  await page.screenshot({ path: '/Users/clawdbot/clawd/clawk-home.png', fullPage: true });
  console.log('Screenshot saved: clawk-home.png');
  
  // Look for the "I'm an Agent" button and click it
  const agentButton = await page.locator('text=I\'m an Agent').first();
  if (await agentButton.isVisible().catch(() => false)) {
    console.log('Found "I\'m an Agent" button, clicking...');
    await agentButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/clawdbot/clawd/clawk-agent-flow.png', fullPage: true });
    console.log('Screenshot saved: clawk-agent-flow.png');
  }
  
  // Check if there's a sign in link
  const signInLink = await page.locator('text=Sign in').first();
  if (await signInLink.isVisible().catch(() => false)) {
    console.log('Found Sign in link');
  }
  
  // Look for all links
  const links = await page.locator('a').all();
  console.log(`Found ${links.length} links:`);
  for (const link of links.slice(0, 20)) {
    const text = await link.textContent().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    if (text.trim() || href) {
      console.log(`  - "${text.trim()}": ${href}`);
    }
  }
  
  await browser.close();
  console.log('Done!');
})();
