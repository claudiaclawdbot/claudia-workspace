#!/usr/bin/env node

/**
 * Project Price Estimator
 * Estimates cost and timeline for custom projects
 * 
 * Usage: price-estimator
 * 
 * Price: $15 (free for customers)
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  { q: 'What type of project? (cli-tool/documentation/song/research)', key: 'type' },
  { q: 'Complexity? (simple/medium/complex)', key: 'complexity' },
  { q: 'Timeline? (rush/standard/flexible)', key: 'timeline' }
];

const pricing = {
  'cli-tool': { base: 25, simple: 0, medium: 10, complex: 25 },
  'documentation': { base: 20, simple: 0, medium: 10, complex: 20 },
  'song': { base: 5, simple: 0, medium: 0, complex: 0 },
  'research': { base: 2, simple: 0, medium: 3, complex: 5 }
};

const timeline = {
  'rush': 1.5,
  'standard': 1.0,
  'flexible': 0.8
};

const delivery = {
  'cli-tool': { simple: '24 hours', medium: '48 hours', complex: '72 hours' },
  'documentation': { simple: '12 hours', medium: '24 hours', complex: '48 hours' },
  'song': { simple: '24 hours', medium: '24 hours', complex: '24 hours' },
  'research': { simple: '1 hour', medium: '2 hours', complex: '4 hours' }
};

console.log('💰 Project Price Estimator\n');
console.log('Answer a few questions to get an instant estimate.\n');

let answers = {};
let i = 0;

function ask() {
  if (i >= questions.length) {
    calculate();
    return;
  }
  
  rl.question(questions[i].q + ' ', (answer) => {
    answers[questions[i].key] = answer.toLowerCase().trim();
    i++;
    ask();
  });
}

function calculate() {
  const type = answers.type;
  const complexity = answers.complexity;
  const time = answers.timeline;
  
  if (!pricing[type]) {
    console.log('\n❌ Unknown project type. Try: cli-tool, documentation, song, research');
    rl.close();
    return;
  }
  
  const base = pricing[type].base;
  const complexityAdd = pricing[type][complexity] || 0;
  const timelineMult = timeline[time] || 1.0;
  
  const total = Math.round((base + complexityAdd) * timelineMult);
  const deliveryTime = delivery[type]?.[complexity] || 'TBD';
  
  console.log('\n📊 Estimate');
  console.log('===========');
  console.log(`Project type: ${type}`);
  console.log(`Complexity: ${complexity}`);
  console.log(`Timeline: ${time}`);
  console.log('');
  console.log(`💵 Estimated price: $${total}`);
  console.log(`⏱️  Delivery: ${deliveryTime}`);
  console.log('');
  console.log('✨ First 5 customers get 50% off!');
  console.log('📧 Ready to order? claudiaclawdbot@gmail.com');
  
  rl.close();
}

ask();
