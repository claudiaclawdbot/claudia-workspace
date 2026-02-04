/**
 * Task.js - Core task management for orchestration system
 * Phase 1: Foundation
 */

const fs = require('fs');
const path = require('path');

/**
 * Task status enum
 */
const TaskStatus = {
  QUEUED: 'queued',
  ASSIGNED: 'assigned',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETRYING: 'retrying'
};

/**
 * Task priority levels (1 = highest)
 */
const TaskPriority = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BACKGROUND: 5
};

/**
 * Task types
 */
const TaskType = {
  RESEARCH: 'research',
  CODE: 'code',
  SOCIAL: 'social',
  MEMORY: 'memory',
  LEARNING: 'learning',
  ORCHESTRATION: 'orchestration'
};

/**
 * Task class - represents a unit of work
 */
class Task {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.type = options.type || TaskType.ORCHESTRATION;
    this.subType = options.subType || null;
    this.priority = options.priority || TaskPriority.NORMAL;
    this.status = options.status || TaskStatus.QUEUED;
    
    this.title = options.title || 'Untitled Task';
    this.description = options.description || '';
    this.deliverables = options.deliverables || [];
    
    this.created = options.created || new Date().toISOString();
    this.deadline = options.deadline || null;
    this.started = options.started || null;
    this.completed = options.completed || null;
    
    this.context = options.context || {};
    this.parentTask = options.parentTask || null;
    this.subTasks = options.subTasks || [];
    
    this.assignedTo = options.assignedTo || null;
    this.result = options.result || null;
    this.error = options.error || null;
    this.retryCount = options.retryCount || 0;
    this.maxRetries = options.maxRetries || 3;
    
    this.metadata = options.metadata || {};
  }

  /**
   * Generate unique task ID
   */
  generateId() {
    const prefix = this.type ? this.type.substring(0, 3) : 'tsk';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Update task status
   */
  updateStatus(newStatus, options = {}) {
    const oldStatus = this.status;
    this.status = newStatus;
    
    if (newStatus === TaskStatus.RUNNING && !this.started) {
      this.started = new Date().toISOString();
    }
    
    if (newStatus === TaskStatus.COMPLETED || newStatus === TaskStatus.FAILED) {
      this.completed = new Date().toISOString();
    }
    
    if (options.error) {
      this.error = options.error;
    }
    
    if (options.result) {
      this.result = options.result;
    }
    
    return {
      taskId: this.id,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Assign task to an agent
   */
  assign(agentId) {
    this.assignedTo = agentId;
    return this.updateStatus(TaskStatus.ASSIGNED);
  }

  /**
   * Mark as running
   */
  start() {
    return this.updateStatus(TaskStatus.RUNNING);
  }

  /**
   * Complete task with result
   */
  complete(result) {
    return this.updateStatus(TaskStatus.COMPLETED, { result });
  }

  /**
   * Fail task with error
   */
  fail(error) {
    this.retryCount++;
    if (this.retryCount < this.maxRetries) {
      return this.updateStatus(TaskStatus.RETRYING, { error });
    }
    return this.updateStatus(TaskStatus.FAILED, { error });
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      subType: this.subType,
      priority: this.priority,
      status: this.status,
      title: this.title,
      description: this.description,
      deliverables: this.deliverables,
      created: this.created,
      deadline: this.deadline,
      started: this.started,
      completed: this.completed,
      context: this.context,
      parentTask: this.parentTask,
      subTasks: this.subTasks,
      assignedTo: this.assignedTo,
      result: this.result,
      error: this.error,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      metadata: this.metadata
    };
  }

  /**
   * Create Task from plain object
   */
  static fromJSON(data) {
    return new Task(data);
  }

  /**
   * Check if task is overdue
   */
  isOverdue() {
    if (!this.deadline) return false;
    return new Date() > new Date(this.deadline);
  }

  /**
   * Get task age in milliseconds
   */
  getAge() {
    return Date.now() - new Date(this.created).getTime();
  }

  /**
   * Get duration if completed
   */
  getDuration() {
    if (!this.started) return null;
    const end = this.completed ? new Date(this.completed) : new Date();
    return end.getTime() - new Date(this.started).getTime();
  }
}

/**
 * TaskQueue - manages a queue of tasks with priority ordering
 */
class TaskQueue {
  constructor(queuePath) {
    this.queuePath = queuePath;
    this.tasks = new Map();
    this.load();
  }

  /**
   * Load tasks from disk
   */
  load() {
    try {
      if (fs.existsSync(this.queuePath)) {
        const data = JSON.parse(fs.readFileSync(this.queuePath, 'utf8'));
        if (data.tasks) {
          data.tasks.forEach(taskData => {
            const task = Task.fromJSON(taskData);
            this.tasks.set(task.id, task);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load task queue:', error.message);
    }
  }

  /**
   * Save tasks to disk
   */
  save() {
    try {
      const data = {
        updated: new Date().toISOString(),
        count: this.tasks.size,
        tasks: Array.from(this.tasks.values()).map(t => t.toJSON())
      };
      fs.mkdirSync(path.dirname(this.queuePath), { recursive: true });
      fs.writeFileSync(this.queuePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save task queue:', error.message);
      return false;
    }
  }

  /**
   * Add a task to the queue
   */
  enqueue(task) {
    if (!(task instanceof Task)) {
      task = new Task(task);
    }
    this.tasks.set(task.id, task);
    this.save();
    return task;
  }

  /**
   * Get next ready task (by priority)
   */
  dequeue() {
    const ready = this.getReady();
    if (ready.length === 0) return null;
    
    // Sort by priority (lower number = higher priority), then by creation time
    ready.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.created) - new Date(b.created);
    });
    
    return ready[0];
  }

  /**
   * Get all ready (queued) tasks
   */
  getReady() {
    return this.getByStatus(TaskStatus.QUEUED);
  }

  /**
   * Get all tasks by status
   */
  getByStatus(status) {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  /**
   * Get task by ID
   */
  get(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * Update a task
   */
  update(task) {
    if (task instanceof Task) {
      this.tasks.set(task.id, task);
    } else {
      const existing = this.tasks.get(task.id);
      if (existing) {
        Object.assign(existing, task);
      }
    }
    this.save();
    return task;
  }

  /**
   * Remove a task
   */
  remove(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      this.tasks.delete(taskId);
      this.save();
    }
    return task;
  }

  /**
   * Get all tasks
   */
  getAll() {
    return Array.from(this.tasks.values());
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const stats = {
      total: this.tasks.size,
      byStatus: {},
      byType: {}
    };
    
    this.tasks.forEach(task => {
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
      stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Get overdue tasks
   */
  getOverdue() {
    return this.getAll().filter(t => t.deadline && t.isOverdue() && 
      ![TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(t.status));
  }

  /**
   * Clear completed/failed tasks older than specified days
   */
  archive(olderThanDays = 7) {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let removed = 0;
    
    this.tasks.forEach((task, id) => {
      if ([TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(task.status)) {
        const completed = task.completed ? new Date(task.completed).getTime() : 0;
        if (completed < cutoff) {
          this.tasks.delete(id);
          removed++;
        }
      }
    });
    
    if (removed > 0) {
      this.save();
    }
    return removed;
  }
}

module.exports = {
  Task,
  TaskQueue,
  TaskStatus,
  TaskPriority,
  TaskType
};
