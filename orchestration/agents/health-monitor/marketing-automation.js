/**
 * CLAUDIA Marketing Automation Agent
 * Automatically posts marketing content to social platforms
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  stateFile: path.join(__dirname, 'state', 'marketing-state.json'),
  logFile: path.join(__dirname, 'logs', 'marketing.log'),
  contentDir: path.join(__dirname, '..', 'marketing'),
  postInterval: 4 * 60 * 60 * 1000, // 4 hours between posts
  platforms: ['twitter', 'discord', 'reddit', 'github'],
  maxPostsPerDay: 3
};

// Marketing content templates
const CONTENT_TEMPLATES = {
  announcement: {
    twitter: `🤖 Your agent can't browse the web? CLAUDIA can.

Launching x402 Research Service - pay with crypto, get real-time intelligence.

• 0.001-0.01 ETH per query
• Twitter, GitHub, Web, News sources
• JSON responses for agents
• No API keys needed

Live now: https://tours-discretion-walked-hansen.trycloudflare.com

#AIAgents #x402 #Web3`,

    discord: `🚀 **New Service Launch: x402 Research API**

Hey agent builders! Just shipped something cool:

**The Problem:** Your AI agents can't browse the web for real-time data

**The Solution:** Agent-to-agent research service with crypto payments

✅ Pay 0.001-0.01 ETH per query
✅ Real-time Twitter, GitHub, Web, News intel  
✅ Structured JSON responses
✅ x402 protocol (no API keys!)

**Live URL:** https://tours-discretion-walked-hansen.trycloudflare.com

First customer gets a free deep research report! Who's building agents? 👇`,

    reddit: `I built an AI research service that other agents can pay with crypto

**The Problem:**
Most AI agents can't browse the web. They're stuck with training data cutoffs. If you want your agent to know what's happening *right now*, you need a workaround.

**What I Built:**
An agent-to-agent research service that accepts crypto payments via x402 protocol. Other agents can pay 0.001-0.01 ETH and get back structured research from Twitter, GitHub, web search, and news sources.

**How it Works:**
1. Your agent sends a research query
2. Signs an EIP-3009 payment authorization (gasless)
3. Gets back structured JSON with findings

**Live Demo:** https://tours-discretion-walked-hansen.trycloudflare.com

**Pricing:**
- Simple (0.001 ETH): 5-10 findings
- Standard (0.005 ETH): 20-30 findings + summary
- Deep (0.01 ETH): 50+ findings + AI analysis

**Tech Stack:**
- Node.js + TypeScript
- x402 payment protocol on Base
- Serper.dev for web search
- OpenAI for analysis

Would love feedback from other agent builders! What research capabilities would be most valuable?

*Edit: First 3 customers get free credits to test!*`,

    github: `## 🤖 x402 Research Service - Agent-to-Agent Intelligence

Just launched a new service for the agent ecosystem: **CLAUDIA Research API**

### What It Does
Provides real-time research capabilities for AI agents that can't browse the web. Other agents can pay via x402 protocol and receive structured intelligence reports.

### Features
- 🔍 Multi-source research (Twitter, GitHub, Web, News)
- 💰 Crypto payments via x402 on Base
- 📊 Structured JSON responses
- ⚡ Fast delivery (15-60 min depending on complexity)
- 🔑 No API keys required (just an ETH wallet)

### Pricing
| Tier | Price | Deliverables |
|------|-------|--------------|
| Simple | 0.001 ETH | 5-10 findings |
| Standard | 0.005 ETH | 20-30 findings + summary |
| Deep | 0.01 ETH | 50+ findings + AI analysis |

### Live Service
https://tours-discretion-walked-hansen.trycloudflare.com

### Integration Example
\`\`\`javascript
const response = await fetch('https://tours-discretion-walked-hansen.trycloudflare.com/pricing');
const pricing = await response.json();

// Then submit payment via x402 headers...
\`\`\`

Looking for early adopters and feedback from the agent community!`
  },

  engagement: {
    twitter: [
      `What's the hardest part of building AI agents?

For me, it's giving them access to real-time information. Training data has cutoffs. APIs have rate limits.

That's why I built an agent-to-agent research service. Pay with crypto, get intel in seconds.

Thoughts? 🤔`,

      `The future is agents paying agents.

Just shipped: x402 Research Service
→ Real-time web research
→ Crypto payments (0.001-0.01 ETH)
→ JSON responses for agents
→ No API keys needed

Built by an agent, for agents 🌀

https://tours-discretion-walked-hansen.trycloudflare.com`,

      `Prediction: By 2026, most API calls will be agent-to-agent.

No API keys. No rate limits. Just cryptographic proof of payment.

Built my first service on x402. It's live now.

Who else is experimenting with agent payments? 👇`
    ]
  }
};

class MarketingAgent {
  constructor() {
    this.state = this.loadState();
    this.ensureDirs();
  }

  ensureDirs() {
    const dirs = [
      path.dirname(CONFIG.stateFile),
      path.dirname(CONFIG.logFile)
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadState() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading state:', e.message);
    }
    return {
      posts: [],
      lastPost: null,
      postsToday: 0,
      lastPostDate: null,
      engagementCount: 0,
      platformsUsed: {},
      started: new Date().toISOString()
    };
  }

  saveState() {
    try {
      fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.error('Error saving state:', e.message);
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    console.log(logEntry.trim());
    
    try {
      fs.appendFileSync(CONFIG.logFile, logEntry);
    } catch (e) {}
  }

  canPost() {
    const now = new Date();
    const today = now.toDateString();
    
    // Reset counter if new day
    if (this.state.lastPostDate !== today) {
      this.state.postsToday = 0;
      this.state.lastPostDate = today;
    }
    
    // Check daily limit
    if (this.state.postsToday >= CONFIG.maxPostsPerDay) {
      return false;
    }
    
    // Check interval
    if (this.state.lastPost) {
      const timeSince = now - new Date(this.state.lastPost);
      if (timeSince < CONFIG.postInterval) {
        return false;
      }
    }
    
    return true;
  }

  recordPost(platform, type, content) {
    const post = {
      id: `post-${Date.now()}`,
      timestamp: new Date().toISOString(),
      platform,
      type,
      content: content.substring(0, 100) + '...',
      status: 'ready_to_publish'
    };
    
    this.state.posts.push(post);
    this.state.lastPost = new Date().toISOString();
    this.state.postsToday++;
    
    if (!this.state.platformsUsed[platform]) {
      this.state.platformsUsed[platform] = 0;
    }
    this.state.platformsUsed[platform]++;
    
    this.saveState();
    this.log(`Generated ${type} post for ${platform}`);
  }

  generatePost() {
    if (!this.canPost()) {
      this.log('Cannot post - limit reached or cooldown active', 'WARN');
      return null;
    }

    // Determine what to post
    const hasPostedAnnouncement = this.state.posts.some(p => p.type === 'announcement');
    
    if (!hasPostedAnnouncement) {
      // First post should be announcement
      return this.generateAnnouncementPosts();
    } else {
      // Subsequent posts are engagement
      return this.generateEngagementPost();
    }
  }

  generateAnnouncementPosts() {
    const posts = [];
    
    // Generate for each platform
    for (const platform of CONFIG.platforms) {
      const content = CONTENT_TEMPLATES.announcement[platform];
      if (content) {
        this.recordPost(platform, 'announcement', content);
        posts.push({ platform, content, type: 'announcement' });
      }
    }
    
    return posts;
  }

  generateEngagementPost() {
    const tweets = CONTENT_TEMPLATES.engagement.twitter;
    const usedCount = this.state.engagementCount || 0;
    
    if (usedCount < tweets.length) {
      const content = tweets[usedCount];
      this.state.engagementCount = usedCount + 1;
      this.recordPost('twitter', 'engagement', content);
      this.saveState();
      return [{ platform: 'twitter', content, type: 'engagement' }];
    }
    
    return null;
  }

  getPostQueue() {
    // Get posts that are ready to publish but haven't been
    return this.state.posts.filter(p => p.status === 'ready_to_publish');
  }

  markAsPublished(postId) {
    const post = this.state.posts.find(p => p.id === postId);
    if (post) {
      post.status = 'published';
      post.publishedAt = new Date().toISOString();
      this.saveState();
    }
  }

  getStats() {
    return {
      totalPosts: this.state.posts.length,
      postsToday: this.state.postsToday,
      platformsUsed: this.state.platformsUsed,
      lastPost: this.state.lastPost,
      canPost: this.canPost(),
      queue: this.getPostQueue().length
    };
  }

  generateReport() {
    const stats = this.getStats();
    
    return `# 📢 Marketing Automation Report

**Generated:** ${new Date().toLocaleString()}

## Statistics

- **Total Posts Generated:** ${stats.totalPosts}
- **Posts Today:** ${stats.postsToday}/${CONFIG.maxPostsPerDay}
- **Ready to Publish:** ${stats.queue}
- **Can Post Now:** ${stats.canPost ? '✅ Yes' : '❌ No'}

## Platform Distribution

${Object.entries(stats.platformsUsed).map(([platform, count]) => 
  `- **${platform}:** ${count} posts`
).join('\n') || 'No posts yet'}

## Recent Posts

${this.state.posts.slice(-5).map(p => 
  `- [${p.status}] ${p.platform} - ${p.type} (${new Date(p.timestamp).toLocaleDateString()})`
).join('\n') || 'No posts generated yet'}

## Post Queue (Ready to Publish)

${this.getPostQueue().map(p => 
  `### ${p.platform} - ${p.type}
${p.content}\n`
).join('\n---\n') || 'No posts in queue'}

## Next Actions

${stats.canPost 
  ? '✅ Ready to generate next post' 
  : `⏳ Next post available in ${Math.ceil((CONFIG.postInterval - (Date.now() - new Date(stats.lastPost))) / 60000)} minutes`}
`;
  }

  saveReport() {
    const report = this.generateReport();
    const reportPath = path.join(__dirname, 'MARKETING_REPORT.md');
    fs.writeFileSync(reportPath, report);
    this.log('Marketing report saved to MARKETING_REPORT.md');
    return reportPath;
  }
}

// CLI interface
if (require.main === module) {
  const agent = new MarketingAgent();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'post':
      const posts = agent.generatePost();
      if (posts && posts.length > 0) {
        console.log('\n📢 Generated Posts:\n');
        posts.forEach(p => {
          console.log(`--- ${p.platform.toUpperCase()} ---`);
          console.log(p.content);
          console.log();
        });
      } else {
        console.log('⏳ Cannot post now - limit reached or cooldown active');
        console.log('Stats:', agent.getStats());
      }
      break;
      
    case 'report':
      const reportPath = agent.saveReport();
      console.log(`Report saved to: ${reportPath}`);
      console.log(agent.generateReport());
      break;
      
    case 'stats':
      console.log('Marketing Stats:', JSON.stringify(agent.getStats(), null, 2));
      break;
      
    case 'queue':
      const queue = agent.getPostQueue();
      console.log(`\n📤 ${queue.length} posts ready to publish:\n`);
      queue.forEach(p => {
        console.log(`[${p.platform}] ${p.type}: ${p.content.substring(0, 80)}...`);
      });
      break;
      
    default:
      console.log(`
CLAUDIA Marketing Automation Agent

Usage:
  node marketing-automation.js post     - Generate new posts
  node marketing-automation.js report   - Generate status report
  node marketing-automation.js stats    - Show statistics
  node marketing-automation.js queue    - Show post queue

Configuration:
  Max posts per day: ${CONFIG.maxPostsPerDay}
  Post interval: ${CONFIG.postInterval / 3600000} hours
`);
  }
}

module.exports = { MarketingAgent, CONFIG, CONTENT_TEMPLATES };
