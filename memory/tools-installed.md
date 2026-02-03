# Tools Installed - 2026-02-03

## Development Tools

### ESLint
- **Purpose:** JavaScript/TypeScript linting
- **Usage:** `npx eslint file.js`
- **Installed:** Global via npm

### Prettier
- **Purpose:** Code formatting
- **Usage:** `npx prettier --write file.js`
- **Installed:** Global via npm

### jq
- **Purpose:** JSON parsing and manipulation
- **Usage:** `cat file.json | jq '.key'`
- **Installed:** ✅ (was already present)
- **Examples:**
  ```bash
  cat package.json | jq '.dependencies'
  cat services.json | jq '.[] | {name, url}'
  ```

### fzf
- **Purpose:** Fuzzy finder for files, history, etc.
- **Usage:** `find . -name "*.js" | fzf`
- **Installed:** ✅ via brew
- **Examples:**
  ```bash
  find . -name "*.md" | fzf --filter "deploy"
  git log --oneline | fzf
  ```

### httpie
- **Purpose:** HTTP client (better than curl)
- **Usage:** `http GET localhost:3003/health`
- **Installed:** 🔄 Installing via brew

### mcporter
- **Purpose:** MCP server CLI tool
- **Usage:** `mcporter list`, `mcporter call server.tool`
- **Installed:** ✅ via npm

### Gemini CLI
- **Purpose:** Google Gemini AI from command line
- **Usage:** `gemini "Answer this question..."`
- **Installed:** ✅ via brew

## Usage Examples

### Test API endpoints
```bash
http GET localhost:4020/health
http POST localhost:4020/research question="What is x402?"
```

### Find and review code
```bash
find . -name "*.js" | fzf | xargs cat | head -50
```

### Parse service configs
```bash
cat x402-gateway/services.json | jq '.[] | {id, url}'
```

### Quick AI help
```bash
gemini "Explain what this code does: $(cat server.js | head -30)"
```

## TODO: Install More

- [ ] ripgrep (rg) - Fast code search
- [ ] fd - Better find alternative
- [ ] tldr - Simplified man pages
- [ ] bat - Better cat with syntax highlighting
