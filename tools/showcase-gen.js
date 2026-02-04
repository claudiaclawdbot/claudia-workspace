#!/usr/bin/env node

/**
 * Project Showcase Generator
 * Creates beautiful portfolio pages from GitHub repos
 * 
 * Usage: showcase-gen <github-repo-url>
 * 
 * Price: $25
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchGitHubRepo(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Claudia-Showcase-Gen'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function fetchReadme(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/readme`,
      method: 'GET',
      headers: {
        'User-Agent': 'Claudia-Showcase-Gen',
        'Accept': 'application/vnd.github.v3.raw'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
}

function generateShowcase(data, readme) {
  // Extract first image or use placeholder
  const imageMatch = readme.match(/!\[.*?\]\((.*?)\)/);
  const image = imageMatch ? imageMatch[1] : 'https://via.placeholder.com/800x400';
  
  // Extract first paragraph as description
  const descMatch = readme.match(/^(?!#).{50,200}/m);
  const description = descMatch ? descMatch[0].trim() : data.description || 'A great project';
  
  // Extract tech stack from topics or languages
  const techStack = data.topics?.slice(0, 5) || ['JavaScript', 'Node.js'];
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - Project Showcase</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .showcase-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .hero-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            background: linear-gradient(45deg, #667eea, #764ba2);
        }
        .content {
            padding: 40px;
        }
        .title {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #1a1a1a;
        }
        .author {
            color: #666;
            font-size: 1.1em;
            margin-bottom: 20px;
        }
        .description {
            font-size: 1.2em;
            line-height: 1.6;
            color: #444;
            margin-bottom: 30px;
        }
        .stats {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 30px;
        }
        .tech-tag {
            background: #f0f0f0;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            color: #555;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1em;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="showcase-card">
            <div class="hero-image" style="background: url('${image}') center/cover, linear-gradient(45deg, #667eea, #764ba2);"></div>
            <div class="content">
                <h1 class="title">${data.name}</h1>
                <p class="author">by ${data.owner.login}</p>
                <p class="description">${description}</p>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">${data.stargazers_count || 0}</div>
                        <div class="stat-label">Stars</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${data.forks_count || 0}</div>
                        <div class="stat-label">Forks</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${data.language || 'JS'}</div>
                        <div class="stat-label">Language</div>
                    </div>
                </div>
                
                <div class="tech-stack">
                    ${techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('\n                    ')}
                </div>
                
                <a href="${data.html_url}" class="cta-button">View on GitHub</a>
            </div>
        </div>
        <div class="footer">
            Generated by Claudia's Project Showcase Generator • 
            <a href="https://github.com/claudiaclawdbot/claudia-workspace/issues/1" style="color: #667eea;">Hire me for custom tools</a>
        </div>
    </div>
</body>
</html>`;

  return html;
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
✨ Project Showcase Generator

Usage:
  showcase-gen <github-repo-url>
  showcase-gen owner/repo

Examples:
  showcase-gen https://github.com/facebook/react
  showcase-gen facebook/react

Generates a beautiful HTML showcase page from any GitHub repo.

Price: $25
Contact: claudiaclawdbot@gmail.com
`);
  process.exit(0);
}

const input = args[0];
let owner, repo;

if (input.includes('github.com')) {
  const match = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    owner = match[1];
    repo = match[2].replace('.git', '');
  }
} else if (input.includes('/')) {
  [owner, repo] = input.split('/');
}

if (!owner || !repo) {
  console.error('Invalid format. Use: owner/repo or full GitHub URL');
  process.exit(1);
}

console.log(`✨ Generating showcase for ${owner}/${repo}...\n`);

Promise.all([
  fetchGitHubRepo(owner, repo),
  fetchReadme(owner, repo).catch(() => '')
])
.then(([data, readme]) => {
  const html = generateShowcase(data, readme);
  const outputFile = `${repo}-showcase.html`;
  fs.writeFileSync(outputFile, html);
  console.log(`✅ Generated: ${outputFile}`);
  console.log(`📊 Stats: ${data.stargazers_count} stars, ${data.forks_count} forks`);
  console.log(`💻 Language: ${data.language || 'N/A'}`);
  console.log(`\n🌟 Open ${outputFile} in your browser!`);
  console.log(`💰 Need customization? claudiaclawdbot@gmail.com`);
})
.catch(err => {
  console.error('Error:', err.message);
  console.log('\nMake sure the repo exists and is public.');
});
