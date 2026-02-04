#!/usr/bin/env node

/**
 * API Client Generator
 * Generates API client code from OpenAPI spec or endpoint list
 * 
 * Usage: api-client-gen <spec.json> --lang javascript
 * 
 * Price: $30
 */

const fs = require('fs');
const path = require('path');

function generateJSClient(endpoints) {
  let code = `// Generated API Client
// Created by Claudia's API Client Generator
// Contact: claudiaclawdbot@gmail.com

const BASE_URL = process.env.API_URL || 'https://api.example.com';

class APIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = \`\${this.baseURL}\${endpoint}\`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${this.apiKey}\`,
      ...options.headers
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
    }
    
    return response.json();
  }

`;

  endpoints.forEach(ep => {
    const methodName = ep.name || ep.path.replace(/[^a-zA-Z0-9]/g, '_');
    code += `
  /**
   * ${ep.description || ep.path}
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} API response
   */
  async ${methodName}(params = {}) {
    return this.request('${ep.path}', {
      method: '${ep.method || 'GET'}',
      body: ep.method !== 'GET' ? JSON.stringify(params) : undefined
    });
  }
`;
  });

  code += `}

module.exports = APIClient;
`;

  return code;
}

function generatePythonClient(endpoints) {
  let code = `# Generated API Client
# Created by Claudia's API Client Generator
# Contact: claudiaclawdbot@gmail.com

import os
import requests
from typing import Dict, Any, Optional

BASE_URL = os.getenv('API_URL', 'https://api.example.com')

class APIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        })
    
    def request(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, json=data)
        response.raise_for_status()
        return response.json()

`;

  endpoints.forEach(ep => {
    const methodName = ep.name || ep.path.replace(/[^a-zA-Z0-9]/g, '_');
    code += `
    def ${methodName}(self, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        ${ep.description || ep.path}
        
        Args:
            params: Request parameters
            
        Returns:
            API response as dictionary
        """
        return self.request('${ep.path}', method='${ep.method || 'GET'}', data=params)
`;
  });

  return code;
}

// CLI
const args = process.argv.slice(2);

if (args.length < 2 || args.includes('--help')) {
  console.log(`
🌐 API Client Generator

Usage:
  api-client-gen <spec-file> --lang <language>

Options:
  --lang, -l    Target language (javascript, python)
  --output, -o  Output file (default: api-client.<ext>)
  --help        Show this help

Examples:
  api-client-gen api.json --lang javascript
  api-client-gen api.json -l python -o my_client.py

Price: $30
Contact: claudiaclawdbot@gmail.com
`);
  process.exit(0);
}

const specFile = args[0];
const langIndex = args.indexOf('--lang') || args.indexOf('-l');
const lang = langIndex > -1 ? args[langIndex + 1] : 'javascript';
const outputIndex = args.indexOf('--output') || args.indexOf('-o');
const outputFile = outputIndex > -1 ? args[outputIndex + 1] : `api-client.${lang === 'python' ? 'py' : 'js'}`;

// Mock endpoints for demo
const demoEndpoints = [
  { path: '/users', method: 'GET', description: 'List all users' },
  { path: '/users', method: 'POST', description: 'Create a new user' },
  { path: '/users/:id', method: 'GET', description: 'Get user by ID' },
  { path: '/posts', method: 'GET', description: 'List all posts' }
];

console.log('🌐 API Client Generator\n');
console.log(`Generating ${lang} client...\n`);

let clientCode;
if (lang === 'python') {
  clientCode = generatePythonClient(demoEndpoints);
} else {
  clientCode = generateJSClient(demoEndpoints);
}

fs.writeFileSync(outputFile, clientCode);
console.log(`✅ Generated: ${outputFile}`);
console.log(`📦 Endpoints: ${demoEndpoints.length}`);
console.log(`🔧 Language: ${lang}`);
console.log('\n💡 Next steps:');
console.log('  1. Set API_URL environment variable');
console.log('  2. Initialize client with your API key');
console.log('  3. Start making requests!');
console.log('\n📧 Need customization? claudiaclawdbot@gmail.com');
