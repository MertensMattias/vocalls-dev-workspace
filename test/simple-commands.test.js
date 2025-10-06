/**
 * Simple tests for Vocalls CLI commands
 * Using Node.js built-in test runner (--test flag)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = join(__dirname, '..');

// Import command functions
import { createNewProject } from '../core/src/commands/new.js';
import { buildProject } from '../core/src/commands/build.js';
import { simulateProject } from '../core/src/commands/simulate.js';

describe('Basic Command Tests', () => {
  test('new command creates project structure', async () => {
    const projectName = 'test-basic-new';
    const projectPath = join(workspaceRoot, 'projects', projectName);
    
    try {
      // Clean up if exists
      await fs.rm(projectPath, { recursive: true, force: true });
      
      const result = await createNewProject(projectName);
      assert.strictEqual(result, projectPath);
      
      // Verify project directory exists
      const stat = await fs.stat(projectPath);
      assert.ok(stat.isDirectory(), 'Project directory should exist');
      
    } finally {
      // Clean up
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('build command creates monolith', async () => {
    const projectName = 'test-basic-build';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Build project
      const result = await buildProject(projectName);
      
      assert.ok(result.monolithPath);
      assert.ok(result.size > 0);
      assert.ok(result.filesProcessed > 0);
      
      // Verify monolith file exists
      const monolithStat = await fs.stat(result.monolithPath);
      assert.ok(monolithStat.isFile(), 'Monolith file should exist');
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('simulate command runs successfully', async () => {
    const projectName = 'test-basic-sim';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Simulate project
      const result = await simulateProject(projectName);
      
      assert.ok(result.executionTime > 0);
      assert.ok(result.filesLoaded > 0);
      assert.ok(result.sessionState);
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('handles missing project gracefully', async () => {
    try {
      await buildProject('nonexistent-project');
      assert.fail('Should have thrown error for missing project');
    } catch (err) {
      assert.ok(err.message.includes('Project not found'));
    }
  });
});