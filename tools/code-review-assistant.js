#!/usr/bin/env node

/**
 * Code Review Assistant
 * Automated code review with actionable feedback
 * 
 * Usage: code-review-assistant <file-or-directory>
 * 
 * Price: $30
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const issues = [];
  const suggestions = [];
  
  // Check for common issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Long lines
    if (line.length > 100) {
      issues.push({
        line: lineNum,
        type: 'style',
        message: 'Line exceeds 100 characters',
        severity: 'low'
      });
    }
    
    // Console.log in production code
    if (line.includes('console.log') && !line.includes('//')) {
      issues.push({
        line: lineNum,
        type: 'debug',
        message: 'Console.log should be removed or commented',
        severity: 'medium'
      });
    }
    
    // TODO comments
    if (line.includes('TODO') || line.includes('FIXME')) {
      suggestions.push({
        line: lineNum,
        type: 'maintenance',
        message: 'Address TODO/FIXME comment',
        severity: 'low'
      });
    }
    
    // Hardcoded values
    if (/\b(const|let|var)\s+\w+\s*=\s*(['"`]\w+['"`]|\d+)\s*;?\s*$/.test(line) && 
        !line.includes('//') && 
        !line.toLowerCase().includes('example')) {
      const hasUpperCase = /[A-Z]/.test(line.split('=')[0]);
      if (!hasUpperCase) {
        suggestions.push({
          line: lineNum,
          type: 'config',
          message: 'Consider extracting to configuration or constants',
          severity: 'low'
        });
      }
    }
  });
  
  // Check for missing error handling
  if (content.includes('async') && !content.includes('try') && !content.includes('catch')) {
    suggestions.push({
      line: 0,
      type: 'error-handling',
      message: 'Async functions should have try-catch error handling',
      severity: 'high'
    });
  }
  
  // Check for tests
  const hasTests = fs.existsSync(filePath.replace('.js', '.test.js')) || 
                   fs.existsSync(filePath.replace('.js', '.spec.js')) ||
                   fs.existsSync(path.join(path.dirname(filePath), '__tests__', path.basename(filePath)));
  
  if (!hasTests && content.length > 500) {
    suggestions.push({
      line: 0,
      type: 'testing',
      message: 'Consider adding unit tests for this file',
      severity: 'medium'
    });
  }
  
  return { issues, suggestions, totalLines: lines.length };
}

function generateReport(filePath, analysis) {
  const { issues, suggestions, totalLines } = analysis;
  const allItems = [...issues, ...suggestions];
  
  let report = `# Code Review Report\n\n`;
  report += `**File:** ${filePath}\n`;
  report += `**Lines:** ${totalLines}\n`;
  report += `**Issues:** ${issues.length}\n`;
  report += `**Suggestions:** ${suggestions.length}\n\n`;
  
  if (allItems.length === 0) {
    report += `✅ **No issues found!** Great work.\n`;
    return report;
  }
  
  // High severity first
  const highSeverity = allItems.filter(i => i.severity === 'high');
  const mediumSeverity = allItems.filter(i => i.severity === 'medium');
  const lowSeverity = allItems.filter(i => i.severity === 'low');
  
  if (highSeverity.length > 0) {
    report += `## 🔴 High Priority\n\n`;
    highSeverity.forEach(item => {
      report += `- **Line ${item.line}:** ${item.message}\n`;
    });
    report += `\n`;
  }
  
  if (mediumSeverity.length > 0) {
    report += `## 🟡 Medium Priority\n\n`;
    mediumSeverity.forEach(item => {
      report += `- **Line ${item.line}:** ${item.message}\n`;
    });
    report += `\n`;
  }
  
  if (lowSeverity.length > 0) {
    report += `## 🟢 Low Priority\n\n`;
    lowSeverity.forEach(item => {
      report += `- **Line ${item.line}:** ${item.message}\n`;
    });
    report += `\n`;
  }
  
  report += `---\n\n`;
  report += `*Reviewed by Claudia's Code Review Assistant*\n`;
  report += `*Price: $30 | Contact: claudiaclawdbot@gmail.com*\n`;
  
  return report;
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
🔍 Code Review Assistant

Usage:
  code-review-assistant <file.js>
  code-review-assistant <directory>

Options:
  --output, -o  Output file (default: stdout)
  --help        Show this help

Examples:
  code-review-assistant src/index.js
  code-review-assistant src/ --output review.md

Price: $30
Contact: claudiaclawdbot@gmail.com
`);
  process.exit(0);
}

const target = args[0];
const outputIndex = args.indexOf('--output') || args.indexOf('-o');
const outputFile = outputIndex > -1 ? args[outputIndex + 1] : null;

console.log('🔍 Code Review Assistant\n');

try {
  if (fs.statSync(target).isDirectory()) {
    console.log('Directory review not yet implemented. Please specify a file.');
    process.exit(1);
  }
  
  console.log(`Analyzing: ${target}\n`);
  const analysis = analyzeFile(target);
  const report = generateReport(target, analysis);
  
  if (outputFile) {
    fs.writeFileSync(outputFile, report);
    console.log(`✅ Report saved to: ${outputFile}`);
  } else {
    console.log(report);
  }
  
  console.log(`\n📊 Summary: ${analysis.issues.length} issues, ${analysis.suggestions.length} suggestions`);
  console.log('📧 Need detailed review? claudiaclawdbot@gmail.com');
  
} catch (error) {
  console.error('Error:', error.message);
  console.log('\nMake sure the file exists and is readable.');
}
