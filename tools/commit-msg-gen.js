#!/usr/bin/env node

/**
 * Commit Message Generator
 * Generates professional commit messages from git diff
 * 
 * Usage: commit-msg-gen
 * 
 * Price: $20
 */

const { execSync } = require('child_process');
const fs = require('fs');

function getGitDiff() {
  try {
    return execSync('git diff --cached --stat', { encoding: 'utf8' });
  } catch (e) {
    return execSync('git diff --stat', { encoding: 'utf8' });
  }
}

function getChangedFiles() {
  try {
    const files = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return files.trim().split('\n').filter(f => f);
  } catch (e) {
    return [];
  }
}

function analyzeChanges(files, diff) {
  const types = {
    feat: ['add', 'create', 'implement', 'new'],
    fix: ['fix', 'bug', 'repair', 'correct'],
    docs: ['doc', 'readme', 'md', 'comment'],
    refactor: ['refactor', 'restructure', 'clean'],
    test: ['test', 'spec'],
    chore: ['config', 'setup', 'deps', 'package']
  };
  
  let type = 'feat';
  let scope = '';
  
  // Detect type from files
  if (files.some(f => f.includes('test') || f.includes('spec'))) type = 'test';
  else if (files.some(f => f.endsWith('.md') || f.includes('README'))) type = 'docs';
  else if (files.some(f => f.includes('package') || f.includes('config'))) type = 'chore';
  else if (diff.includes('fix') || diff.includes('bug')) type = 'fix';
  
  // Detect scope
  const dirs = files.map(f => f.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i);
  if (dirs.length === 1) scope = dirs[0];
  
  return { type, scope };
}

function generateMessages(files, diff, type, scope) {
  const scopeStr = scope ? `(${scope})` : '';
  const fileCount = files.length;
  const mainFile = files[0]?.split('/').pop() || 'files';
  
  const templates = [
    `${type}${scopeStr}: Add ${mainFile}`,
    `${type}${scopeStr}: Update ${fileCount} file${fileCount > 1 ? 's' : ''}`,
    `${type}${scopeStr}: Implement ${mainFile.replace(/\.(js|ts|jsx|tsx)$/, '')}`,
    `${type}${scopeStr}: ${type === 'fix' ? 'Fix' : 'Add'} ${mainFile}`,
    `${type}${scopeStr}: ${type} ${files.map(f => f.split('/').pop()).slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`
  ];
  
  return templates;
}

// Main
console.log('📝 Commit Message Generator\n');

try {
  const files = getChangedFiles();
  const diff = getGitDiff();
  
  if (files.length === 0) {
    console.log('No changes detected. Stage files with git add first.');
    process.exit(0);
  }
  
  console.log(`Changed files: ${files.length}`);
  files.forEach(f => console.log(`  • ${f}`));
  console.log('');
  
  const { type, scope } = analyzeChanges(files, diff);
  const messages = generateMessages(files, diff, type, scope);
  
  console.log('Suggested commit messages:\n');
  messages.forEach((msg, i) => {
    console.log(`${i + 1}. ${msg}`);
  });
  
  console.log('\n💡 Tip: Use conventional commits format');
  console.log('📧 Need customization? claudiaclawdbot@gmail.com');
  
} catch (error) {
  console.error('Error:', error.message);
  console.log('\nMake sure you\'re in a git repository.');
}
