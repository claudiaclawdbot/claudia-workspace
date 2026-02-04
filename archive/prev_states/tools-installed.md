
# Installed Development Tools

This document lists the development tools installed in this environment, along with usage examples.

## Code Quality & Formatting

- **ESLint:** JavaScript linter.  Already installed.
  - Usage: `eslint yourfile.js`
- **Prettier:** Code formatter.  Already installed.
  - Usage: `prettier --write yourfile.js`
- **Biome:** JavaScript/TypeScript linter, formatter, and more.
  - Installation: `npm install -g biome`
  - Usage: `biome format yourfile.js` or `biome check yourfile.js`
- **TypeScript:** Superset of JavaScript that adds static typing.
  - Installation: `brew install typescript`
  - Usage: `tsc yourfile.ts` (compile to JavaScript)

## Git Helpers

- **Git:** Version control system. Already installed.
- **GitHub CLI (gh):** Command-line interface for GitHub. Already installed.
  - Usage: `gh repo clone owner/repo`
- **Git-extras:** Collection of useful git utilities.
  - Installation: `brew install git-extras`
  - Usage: `git summary` (shows repository summary), `git effort` (shows effort statistics)
- **delta:** A syntax-highlighting pager for git.
  - Installation: `brew install git-delta`
  - Configured automatically via `git config --global core.pager "delta"` etc.
  - Usage: git diff, git log -p
- **Lazygit:** A simple terminal UI for git commands. Visual git interface. Requires a terminal.
  - Installation: `brew install lazygit`
  - Usage: `lazygit`
- **ghq:** Remote repository management tool.  Helps organize local clones of remote repos.
  - Installation: `brew install ghq`
  - Usage: `ghq get github.com/user/repo`

## Modern CLI tools

- **fzf:** Fuzzy finder for the command line.
  - Installation: `brew install fzf`

  - Integration: Add `source <(fzf --zsh)` to `~/.zshrc` for shell integration
  - Usage: Ctrl+T to find files, Alt+C to find git commits.
- **fd:** A simple, fast and user-friendly alternative to 'find'.
  - Installation: `brew install fd`
  - Usage: `fd pattern` (find files matching pattern), `fd -e js` (find JavaScript files)
- **ripgrep (rg):** A line-oriented search tool that recursively searches your current directory for a regex pattern.

  - Installation: `brew install ripgrep`

  - Usage: `rg pattern` (search for pattern in files), `rg pattern -g '*.js'` (search only in JavaScript files)
- **bat:** A cat(1) clone with wings. Displays file content with syntax highlighting.
  - Installation: `brew install bat`
  - Usage: `bat yourfile.js`, `bat --paging=never yourfile.js`
  - Aliased `cat` to `bat` so `cat file` will now syntax highlight.
- **eza:** A modern, maintained replacement for ls. Directory listing with icons.
  - Installation: `brew install eza`
  - Usage: `eza`, `eza -la`, `eza --tree`
  - Aliased `ls`, `ll`, `lt` to `eza` with different options for more informative directory listings.
- **tree:** Displays directory trees.
  - Installation: `brew install tree`
  - Usage: `tree`, `tree -L 2` (limit to level 2)

## Data Processing

- **jq:** Command-line JSON processor.
  - Installation: `brew install jq`
  - Usage: `jq '.key' data.json` (extract value of 'key'), `jq . data.json | less`
- **yq:** Portable command-line YAML processor
  - Installation: `brew install yq`
  - Usage: `yq '.key' data.yaml` (extract value of 'key'), `yq e '.key = "newvalue"' -i data.yaml` (edit in place)
- **httpie:** User-friendly command-line HTTP client.
  - Installation: `brew install httpie`
  - Usage: `http GET example.com`, `http POST example.com name=value`

## Package Managers

- **npm:** Node Package Manager. Already installed with Node.js.
- **pnpm:** Fast, disk space efficient package manager.
  - Installation: `npm install -g pnpm`
  - Usage: `pnpm install`, `pnpm add package-name`
- **bun:** A fast JavaScript runtime and package manager
  - Installation: Already installed

## Blockchain/Web3

- **Foundry:** blazing fast, portable and modular toolkit for Ethereum application development
  - Installation: Already installed

## Help Utilities

- **tldr/tlrc:** Simplified and community-driven man pages.
  - Installation: `brew install tlrc`
  - Usage: `tldr ls` (shows simplified help for `ls` command)
- **thefuck:** Corrects your previous console command.
  - Installation: `brew install thefuck`
  - Integration: Add `eval $(thefuck --alias)` to `~/.zshrc`
  - Usage: Type a wrong command, then type `fuck` (it will try to correct it).

## Fidget-play specific

- **Foundry**: Already installed
### Aliases

The following aliases have been added to `~/.zshrc`:
```
# Aliases
alias cat='bat --paging=never'
alias ls='eza --icons --group-directories-first'
alias ll='eza -la --icons --group-directories-first'
alias lt='eza --tree --icons --level=2'
alias fzp='fzf --preview "bat --color=always --style=numbers --line-range=:500 {}"'
alias gs='git status'
alias gl='git log --oneline --graph -20'
alias gco='git checkout'
alias gcm='git commit -m'
alias gd='git diff'
alias gds='git diff --staged'
```
