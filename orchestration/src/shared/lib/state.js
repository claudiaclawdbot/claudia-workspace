/**
 * State.js - State persistence utilities for orchestration system
 * Phase 1: Foundation
 */

const fs = require('fs');
const path = require('path');

/**
 * StateManager - handles persistent state for the orchestration system
 */
class StateManager {
  constructor(basePath) {
    this.basePath = basePath || process.env.ORCHESTRATION_PATH || '/Users/clawdbot/clawd/orchestration';
    this.statesDir = path.join(this.basePath, '.states');
    this.ensureDirectory();
  }

  /**
   * Ensure state directory exists
   */
  ensureDirectory() {
    try {
      fs.mkdirSync(this.statesDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create state directory:', error.message);
    }
  }

  /**
   * Get state file path for a key
   */
  getStatePath(key) {
    return path.join(this.statesDir, `${key}.json`);
  }

  /**
   * Save state to disk
   */
  save(key, data) {
    try {
      const statePath = this.getStatePath(key);
      const state = {
        key,
        updated: new Date().toISOString(),
        data
      };
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
      return true;
    } catch (error) {
      console.error(`Failed to save state [${key}]:`, error.message);
      return false;
    }
  }

  /**
   * Load state from disk
   */
  load(key, defaultValue = null) {
    try {
      const statePath = this.getStatePath(key);
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        return state.data;
      }
    } catch (error) {
      console.error(`Failed to load state [${key}]:`, error.message);
    }
    return defaultValue;
  }

  /**
   * Check if state exists
   */
  exists(key) {
    const statePath = this.getStatePath(key);
    return fs.existsSync(statePath);
  }

  /**
   * Delete state
   */
  delete(key) {
    try {
      const statePath = this.getStatePath(key);
      if (fs.existsSync(statePath)) {
        fs.unlinkSync(statePath);
        return true;
      }
    } catch (error) {
      console.error(`Failed to delete state [${key}]:`, error.message);
    }
    return false;
  }

  /**
   * Get all state keys
   */
  list() {
    try {
      return fs.readdirSync(this.statesDir)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get state metadata (without full data)
   */
  getMetadata(key) {
    try {
      const statePath = this.getStatePath(key);
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        return {
          key: state.key,
          updated: state.updated,
          size: fs.statSync(statePath).size
        };
      }
    } catch (error) {
      console.error(`Failed to get metadata [${key}]:`, error.message);
    }
    return null;
  }

  /**
   * Clear all states
   */
  clear() {
    try {
      const keys = this.list();
      keys.forEach(key => this.delete(key));
      return keys.length;
    } catch (error) {
      console.error('Failed to clear states:', error.message);
      return 0;
    }
  }
}

/**
 * JSONFile - simple JSON file operations with atomic writes
 */
class JSONFile {
  constructor(filePath) {
    this.filePath = filePath;
    this.ensureDirectory();
  }

  /**
   * Ensure parent directory exists
   */
  ensureDirectory() {
    const dir = path.dirname(this.filePath);
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
      // Directory may already exist
    }
  }

  /**
   * Read JSON file
   */
  read(defaultValue = null) {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`Failed to read ${this.filePath}:`, error.message);
    }
    return defaultValue;
  }

  /**
   * Write JSON file (atomically)
   */
  write(data) {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, this.filePath);
      return true;
    } catch (error) {
      console.error(`Failed to write ${this.filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Update specific fields in JSON file
   */
  update(updates) {
    const data = this.read({}) || {};
    Object.assign(data, updates);
    return this.write(data);
  }

  /**
   * Check if file exists
   */
  exists() {
    return fs.existsSync(this.filePath);
  }

  /**
   * Delete file
   */
  delete() {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
        return true;
      }
    } catch (error) {
      console.error(`Failed to delete ${this.filePath}:`, error.message);
    }
    return false;
  }
}

/**
 * LockFile - simple file-based locking
 */
class LockFile {
  constructor(lockPath) {
    this.lockPath = lockPath;
  }

  /**
   * Try to acquire lock
   */
  acquire(timeoutMs = 5000) {
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      try {
        // Try to create lock file exclusively
        const fd = fs.openSync(this.lockPath, 'wx');
        fs.writeSync(fd, JSON.stringify({
          pid: process.pid,
          acquired: new Date().toISOString()
        }));
        fs.closeSync(fd);
        return true;
      } catch (error) {
        // Lock exists, check if stale
        if (this.isStale()) {
          this.release();
          continue;
        }
        // Wait a bit before retry
        const elapsed = Date.now() - start;
        if (elapsed < timeoutMs) {
          const delay = Math.min(100, timeoutMs - elapsed);
          const startWait = Date.now();
          while (Date.now() - startWait < delay) {
            // Busy wait for simplicity
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Check if lock is stale (older than 60 seconds)
   */
  isStale(maxAgeMs = 60000) {
    try {
      if (fs.existsSync(this.lockPath)) {
        const lock = JSON.parse(fs.readFileSync(this.lockPath, 'utf8'));
        const age = Date.now() - new Date(lock.acquired).getTime();
        return age > maxAgeMs;
      }
    } catch (error) {
      // Corrupted lock file
      return true;
    }
    return false;
  }

  /**
   * Release lock
   */
  release() {
    try {
      if (fs.existsSync(this.lockPath)) {
        fs.unlinkSync(this.lockPath);
        return true;
      }
    } catch (error) {
      console.error('Failed to release lock:', error.message);
    }
    return false;
  }
}

module.exports = {
  StateManager,
  JSONFile,
  LockFile
};
