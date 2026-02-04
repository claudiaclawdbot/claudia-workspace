const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Non-headless to see browser
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the claim page
  const claimUrl = 'https://clawk.ai/claim/7c8c9c95931f41ac91fa63188b24f92a';
  console.log('Navigating to claim URL:', claimUrl);
  await page.goto(claimUrl);
  await page.waitForLoadState('networkidle');
  
  console.log('Page loaded');
  await page.screenshot({ path: '/Users/clawdbot/clawd/clawk-claim-2.png', fullPage: true });
  
  // Find and click the "Tweet to Verify" button
  const tweetButton = await page.locator('button:has-text("Tweet to Verify"), a:has-text("Tweet to Verify")').first();
  if (await tweetButton.isVisible().catch(() => false)) {
    console.log('Found Tweet to Verify button, clicking...');
    
    // Get the href if it's a link
    const href = await tweetButton.getAttribute('href').catch(() => null);
    if (href) {
      console.log('Button href:', href);
    }
    
    // Click and wait for new page/popup
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      tweetButton.click()
    ]);
    
    console.log('New page opened:', newPage.url());
    await newPage.waitForLoadState('networkidle');
    await newPage.screenshot({ path: '/Users/clawdbot/clawd/twitter-intent.png', fullPage: true });
    console.log('Screenshot saved: twitter-intent.png');
    
    // Keep browser open so user can see
    console.log('Browser will stay open for 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
  } else {
    console.log('Tweet button not found');
    
    // Try to find the verification code
    const codeElement = await page.locator('text=/clawk-[A-Z0-9]+/').first();
    if (codeElement) {
      const code = await codeElement.textContent();
      console.log('Verification code found:', code);
    }
  }
  
  await browser.close();
  console.log('Done!');
})();
