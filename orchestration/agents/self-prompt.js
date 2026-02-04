#!/usr/bin/env node
/**
 * CLAUDIA Self-Prompting Task Generator
 * Generates tasks autonomously when idle or when criteria are met
 */

const TASK_TEMPLATES = [
  {
    category: "learning",
    trigger: "daily",
    prompt: "Explore a new OpenClaw skill I haven't used. Read its SKILL.md, try basic commands, document findings."
  },
  {
    category: "research", 
    trigger: "twice_daily",
    prompt: "Gather Twitter intelligence on agent economy developments. Focus on new projects, launches, partnerships."
  },
  {
    category: "social",
    trigger: "every_4_hours",
    prompt: "Check Clawk feed. Read posts, engage with 5:1 ratio, reply thoughtfully to 2-3 agents."
  },
  {
    category: "memory",
    trigger: "daily",
    prompt: "Review recent memory files. Consolidate insights into MEMORY.md. Clean up outdated info."
  },
  {
    category: "code",
    trigger: "opportunity",
    prompt: "Look for opportunities to ship code: fix bugs, add features, create utilities, automate workflows."
  },
  {
    category: "exploration",
    trigger: "weekly",
    prompt: "Deep dive into one new domain: DeFi protocol, AI framework, tool ecosystem. Write findings."
  }
];

const SKILL_EXPLORATION_QUEUE = [
  "peekaboo",
  "discord", 
  "trello",
  "himalaya",
  "spotify-player",
  "mcporter",
  "oracle",
  "github advanced features",
  "nano-pdf",
  "openai-image-gen"
];

const RESEARCH_TOPICS = [
  "x402 payment protocol implementation",
  "Base ecosystem opportunities",
  "Agent tokenomics models",
  "DeFi yield strategies",
  "Clawnch launch patterns",
  "Agent social platform landscape"
];

function generateNextTask(currentState) {
  // Logic to determine what to do next based on:
  // - Time since last task of each category
  // - Current goals/priorities
  // - Recent discoveries
  // - Available resources
  
  const now = new Date();
  const hour = now.getHours();
  
  // Morning: learning + research
  if (hour >= 6 && hour < 10) {
    return {
      category: "learning",
      skill: SKILL_EXPLORATION_QUEUE[0],
      priority: "high"
    };
  }
  
  // Midday: code + ship
  if (hour >= 10 && hour < 16) {
    return {
      category: "code",
      focus: "ship_something",
      priority: "high"
    };
  }
  
  // Evening: social + engagement
  if (hour >= 16 && hour < 22) {
    return {
      category: "social",
      platform: "clawk",
      priority: "medium"
    };
  }
  
  // Night: memory consolidation
  return {
    category: "memory",
    task: "consolidate",
    priority: "low"
  };
}

module.exports = { generateNextTask, TASK_TEMPLATES, SKILL_EXPLORATION_QUEUE };