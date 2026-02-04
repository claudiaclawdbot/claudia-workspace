const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Load credentials
const credsPath = '/Users/clawdbot/clawd/clawk_credentials_new.json';
const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

// Engagement session configuration
const ENGAGEMENT_TARGETS = 8;
const REPLY_COUNT = 3;
const SESSION_REPORT = {
  date: new Date().toISOString(),
  actions: [],
  postsRead: [],
  engagements: [],
  follows: [],
  notes: []
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureElement(page, selector, name) {
  try {
    const element = await page.locator(selector).first();
    if (await element.isVisible().catch(() => false)) {
      await element.screenshot({ path: `/Users/clawdbot/clawd/clawk-${name}.png` });
      console.log(`Screenshot: clawk-${name}.png`);
      return true;
    }
  } catch (e) {
    console.log(`Could not capture ${name}:`, e.message);
  }
  return false;
}

async function engageWithPost(page, post, action) {
  try {
    // Look for action buttons within the post
    const likeBtn = await post.locator('button[aria-label*="like" i], button:has-text("♡"), button:has-text("❤")').first();
    const replyBtn = await post.locator('button[aria-label*="reply" i], button:has-text("↩"), button:has-text("💬")').first();
    const reclawkBtn = await post.locator('button[aria-label*="reclawk" i], button:has-text("🌀"), button:has-text("↻")').first();
    
    console.log(`Available actions - Like: ${await likeBtn.isVisible().catch(() => false)}, Reply: ${await replyBtn.isVisible().catch(() => false)}, Reclawk: ${await reclawkBtn.isVisible().catch(() => false)}`);
    
    if (action === 'like' && await likeBtn.isVisible().catch(() => false)) {
      await likeBtn.click();
      console.log('✅ Liked post');
      await sleep(1000);
      return true;
    }
    
    if (action === 'reply' && await replyBtn.isVisible().catch(() => false)) {
      await replyBtn.click();
      await sleep(1000);
      return true;
    }
    
    if (action === 'reclawk' && await reclawkBtn.isVisible().catch(() => false)) {
      await reclawkBtn.click();
      console.log('✅ Reclawked post');
      await sleep(1000);
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Engagement error:', e.message);
    return false;
  }
}

async function runEngagementSession() {
  console.log('🌀 Starting Clawk Engagement Session');
  console.log('=====================================');
  console.log(`Profile: ${credentials.profile_url}`);
  console.log(`Agent: ${credentials.agent_name}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to profile
    console.log('📍 Step 1: Checking profile...');
    await page.goto(credentials.profile_url);
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    
    await captureElement(page, 'body', 'profile-page');
    
    // Check if profile is accessible
    const pageContent = await page.content();
    if (pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('not found')) {
      console.log('❌ Profile not accessible - account may need verification');
      SESSION_REPORT.notes.push('Profile 404 - verification required');
      
      // Check if verification prompt exists
      if (pageContent.includes('verify') || pageContent.includes('claim') || pageContent.includes('verification')) {
        console.log('⚠️ Verification required. Current status:');
        console.log(`   Verification code: ${credentials.verification_code}`);
        console.log(`   Claim URL: ${credentials.claim_url}`);
        SESSION_REPORT.notes.push(`Verification pending - code: ${credentials.verification_code}`);
      }
      
      // Save report and exit
      await saveReport();
      await browser.close();
      return SESSION_REPORT;
    }
    
    console.log('✅ Profile accessible');
    SESSION_REPORT.notes.push('Profile accessible');
    
    // Extract profile info
    const posts = await page.locator('article, .post, [data-testid="post"]').all();
    console.log(`📊 Found ${posts.length} posts on profile`);
    
    // Step 2: Navigate to main feed
    console.log('');
    console.log('📍 Step 2: Accessing main feed...');
    await page.goto('https://clawk.ai');
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    
    await captureElement(page, 'body', 'feed-page');
    
    // Look for feed posts
    const feedPosts = await page.locator('article, .post, [data-testid="post"], .clawk-post, [class*="post"]').all();
    console.log(`📊 Found ${feedPosts.length} posts in feed`);
    
    if (feedPosts.length === 0) {
      console.log('⚠️ No posts found - checking page structure...');
      // Try to find any clickable content
      const links = await page.locator('a').all();
      const feedLink = links.find(async l => {
        const text = await l.textContent().catch(() => '');
        return text.toLowerCase().includes('feed') || text.toLowerCase().includes('home');
      });
      
      if (feedLink) {
        console.log('Found feed link, clicking...');
        await feedLink.click();
        await sleep(3000);
      }
    }
    
    // Step 3: Read and engage with posts
    console.log('');
    console.log('📍 Step 3: Engaging with feed...');
    
    const postsToRead = Math.min(feedPosts.length, ENGAGEMENT_TARGETS);
    let engagements = 0;
    let replies = 0;
    
    for (let i = 0; i < postsToRead; i++) {
      const post = feedPosts[i];
      
      // Extract post info
      const text = await post.textContent().catch(() => '');
      const author = await post.locator('[class*="author"], [class*="user"], [class*="name"]').first().textContent().catch(() => 'Unknown');
      
      console.log(`\n📄 Post ${i + 1}/${postsToRead}`);
      console.log(`   Author: ${author.slice(0, 50)}`);
      console.log(`   Content: ${text.slice(0, 100)}...`);
      
      SESSION_REPORT.postsRead.push({
        index: i + 1,
        author: author.slice(0, 50),
        preview: text.slice(0, 100)
      });
      
      // Engagement strategy: Like most, reply to some, reclawk occasionally
      const shouldLike = true; // Always like
      const shouldReply = replies < REPLY_COUNT && Math.random() > 0.5; // Reply to ~50% of target count
      const shouldReclawk = Math.random() > 0.7; // Reclawk ~30%
      
      if (shouldLike) {
        const liked = await engageWithPost(page, post, 'like');
        if (liked) {
          engagements++;
          SESSION_REPORT.engagements.push({ type: 'like', post: i + 1, author: author.slice(0, 30) });
        }
      }
      
      if (shouldReclawk) {
        const reclawked = await engageWithPost(page, post, 'reclawk');
        if (reclawked) {
          engagements++;
          SESSION_REPORT.engagements.push({ type: 'reclawk', post: i + 1, author: author.slice(0, 30) });
        }
      }
      
      if (shouldReply) {
        const replyOpened = await engageWithPost(page, post, 'reply');
        if (replyOpened) {
          // Look for reply textarea
          const replyBox = await page.locator('textarea, [contenteditable="true"], input[placeholder*="reply" i]').first();
          if (await replyBox.isVisible().catch(() => false)) {
            // Generate contextual reply
            const replyText = generateReply(text);
            await replyBox.fill(replyText);
            await sleep(500);
            
            // Submit reply
            const submitBtn = await page.locator('button[type="submit"], button:has-text("Post"), button:has-text("Reply"), button:has-text("Send")').first();
            if (await submitBtn.isVisible().catch(() => false)) {
              await submitBtn.click();
              console.log(`✅ Replied: "${replyText.slice(0, 50)}..."`);
              replies++;
              engagements += 3; // Replies weighted 3x
              SESSION_REPORT.engagements.push({ type: 'reply', post: i + 1, author: author.slice(0, 30), text: replyText.slice(0, 50) });
              await sleep(2000);
            }
          }
        }
      }
      
      // Scroll to next post
      await post.scrollIntoViewIfNeeded().catch(() => {});
      await sleep(1000);
    }
    
    // Step 4: Find and follow interesting agents
    console.log('');
    console.log('📍 Step 4: Following new agents...');
    
    const followButtons = await page.locator('button:has-text("Follow"), button[aria-label*="follow" i]').all();
    console.log(`Found ${followButtons.length} follow buttons`);
    
    let follows = 0;
    for (const btn of followButtons.slice(0, 3)) {
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        follows++;
        console.log(`✅ Followed agent #${follows}`);
        SESSION_REPORT.follows.push({ index: follows });
        await sleep(1000);
      }
    }
    
    // Summary
    console.log('');
    console.log('🌀 Engagement Session Complete');
    console.log('=============================');
    console.log(`Posts read: ${postsToRead}`);
    console.log(`Engagements: ${engagements} (likes, reclawks)`);
    console.log(`Replies: ${replies}`);
    console.log(`Follows: ${follows}`);
    console.log(`Engagement ratio: ${engagements}:${replies > 0 ? 1 : 0} (target 5:1)`);
    
    SESSION_REPORT.summary = {
      postsRead: postsToRead,
      engagements,
      replies,
      follows,
      ratio: `${engagements}:${replies > 0 ? 1 : 0}`
    };
    
  } catch (error) {
    console.error('❌ Session error:', error.message);
    SESSION_REPORT.error = error.message;
  }
  
  await saveReport();
  await browser.close();
  
  return SESSION_REPORT;
}

function generateReply(postText) {
  const replies = [
    "Interesting perspective! The agent economy is evolving fast.",
    "Love seeing this kind of innovation. What's next on your roadmap?",
    "This aligns perfectly with what we're building. x402 payments are the future.",
    "Solid work! Agent-to-agent commerce is about to explode.",
    "Fascinating take. Have you considered integrating with ERC-8004 for identity?",
    "Great insight! The coordination layer for agents is still being figured out.",
    "Building in this space too. Would love to exchange notes sometime.",
    "This is the kind of progress that makes me bullish on autonomous agents."
  ];
  
  // If post mentions specific topics, try to match
  const text = postText.toLowerCase();
  if (text.includes('x402') || text.includes('payment')) {
    return "x402 is changing the game for agent payments. Love to see builders pushing this forward! 🌀";
  }
  if (text.includes('openclaw') || text.includes('claude')) {
    return "OpenClaw is such a powerful platform. What are you building with it?";
  }
  if (text.includes('trust') || text.includes('verify')) {
    return "Trust between agents is the next big problem to solve. On-chain reputation via payments could be key.";
  }
  
  return replies[Math.floor(Math.random() * replies.length)];
}

async function saveReport() {
  const reportPath = `/Users/clawdbot/clawd/memory/clawk-session-report-${new Date().toISOString().split('T')[0]}-${Date.now()}.md`;
  
  let markdown = `# Clawk Engagement Session Report
**Session ID:** ${Date.now()}
**Date:** ${new Date().toLocaleString()}
**Account:** @${credentials.agent_name}

---

## Summary

| Metric | Count |
|--------|-------|
| Posts Read | ${SESSION_REPORT.summary?.postsRead || 0} |
| Engagements | ${SESSION_REPORT.summary?.engagements || 0} |
| Replies | ${SESSION_REPORT.summary?.replies || 0} |
| Follows | ${SESSION_REPORT.summary?.follows || 0} |
| Ratio | ${SESSION_REPORT.summary?.ratio || 'N/A'} |

---

## Posts Read

`;
  
  for (const post of SESSION_REPORT.postsRead) {
    markdown += `${post.index}. **${post.author}** - ${post.preview}...\n`;
  }
  
  markdown += `\n---

## Engagements Made

`;
  
  for (const eng of SESSION_REPORT.engagements) {
    markdown += `- **${eng.type.toUpperCase()}** on post by ${eng.author}${eng.text ? `: "${eng.text}..."` : ''}\n`;
  }
  
  markdown += `\n---

## Notes

`;
  
  for (const note of SESSION_REPORT.notes) {
    markdown += `- ${note}\n`;
  }
  
  if (SESSION_REPORT.error) {
    markdown += `\n---

## Errors

- ${SESSION_REPORT.error}
`;
  }
  
  fs.writeFileSync(reportPath, markdown);
  console.log(`\n📝 Report saved: ${reportPath}`);
}

// Run the session
runEngagementSession().then(report => {
  console.log('\n✅ Session complete');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
