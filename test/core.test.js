/**
 * Basic test suite for Vocalls Development Environment
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

describe('Vocalls Development Environment', () => {
  test('workspace structure exists', async () => {
    const requiredDirs = ['core', 'docs'];
    
    for (const dir of requiredDirs) {
      const dirPath = join(workspaceRoot, dir);
      const stat = await fs.stat(dirPath);
      assert.ok(stat.isDirectory(), `${dir} should be a directory`);
    }
  });
  
  test('package.json has correct workspace configuration', async () => {
    const packagePath = join(workspaceRoot, 'package.json');
    const content = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(content);
    
    assert.ok(pkg.workspaces, 'should have workspaces configuration');
    assert.ok(pkg.workspaces.includes('core'), 'should include core workspace');
    assert.ok(pkg.workspaces.includes('projects/*'), 'should include projects workspace');
  });
  
  test('core package.json is configured correctly', async () => {
    const corePkgPath = join(workspaceRoot, 'core', 'package.json');
    const content = await fs.readFile(corePkgPath, 'utf8');
    const pkg = JSON.parse(content);
    
    assert.strictEqual(pkg.type, 'module', 'core should use ES modules');
    assert.ok(pkg.bin.voc, 'should have voc binary');
    assert.ok(pkg.main, 'should have main entry point');
  });
  
  test('CLI entry point exists and is executable', async () => {
    const cliPath = join(workspaceRoot, 'core', 'bin', 'voc.mjs');
    const stat = await fs.stat(cliPath);
    assert.ok(stat.isFile(), 'CLI file should exist');
    
    const content = await fs.readFile(cliPath, 'utf8');
    assert.ok(content.includes('#!/usr/bin/env node'), 'should have shebang');
    assert.ok(content.includes('commander'), 'should use commander for CLI');
  });
  
  test('all required commands are implemented', async () => {
    const commandsDir = join(workspaceRoot, 'core', 'src', 'commands');
    const requiredCommands = ['build.js', 'new.js', 'simulate.js', 'clean.js', 'project.js'];
    
    for (const cmd of requiredCommands) {
      const cmdPath = join(commandsDir, cmd);
      const stat = await fs.stat(cmdPath);
      assert.ok(stat.isFile(), `${cmd} command should exist`);
    }
  });
  
  test('simulation engine exists', async () => {
    const enginePath = join(workspaceRoot, 'core', 'src', 'simulator', 'engine.js');
    const stat = await fs.stat(enginePath);
    assert.ok(stat.isFile(), 'simulation engine should exist');
    
    const content = await fs.readFile(enginePath, 'utf8');
    assert.ok(content.includes('VocallsSimulator'), 'should export VocallsSimulator class');
    assert.ok(content.includes('vm'), 'should use Node.js vm module');
  });
  
  test('ES5.1 validation exists', async () => {
    const validationPath = join(workspaceRoot, 'core', 'src', 'utils', 'validation.js');
    const stat = await fs.stat(validationPath);
    assert.ok(stat.isFile(), 'validation utilities should exist');
    
    const content = await fs.readFile(validationPath, 'utf8');
    assert.ok(content.includes('validateES51Compliance'), 'should have ES5.1 validation function');
  });
  
  test('documentation is comprehensive', async () => {
    const requiredDocs = [
      'architecture.md',
      'getting-started.md',
      'cli.md',
      'simulation.md'
    ];
    
    for (const doc of requiredDocs) {
      const docPath = join(workspaceRoot, 'docs', doc);
      const stat = await fs.stat(docPath);
      assert.ok(stat.isFile(), `${doc} documentation should exist`);
    }
  });
  
  test('no TypeScript files exist', async () => {
    // Recursively check for .ts files (excluding node_modules)
    async function findTsFiles(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const tsFiles = [];
      
      for (const entry of entries) {
        if (entry.name === 'node_modules') {
          continue;
        }
        
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          tsFiles.push(...await findTsFiles(fullPath));
        } else if (entry.name.endsWith('.ts')) {
          tsFiles.push(fullPath);
        }
      }
      
      return tsFiles;
    }
    
    const tsFiles = await findTsFiles(workspaceRoot);
    assert.strictEqual(tsFiles.length, 0, `Found TypeScript files: ${tsFiles.join(', ')}`);
  });
});

describe('Build System', () => {
  test('build validation functions work', async () => {
    // Import the validation function
    const { validateES51Compliance } = await import('../core/src/utils/validation.js');
    
    // Test forbidden patterns
    const badCode = `
      const x = 1;
      let y = 2;
      () => 'arrow';
      console.log('test');
    `;
    
    const violations = validateES51Compliance(badCode);
    assert.ok(violations.length > 0, 'should detect ES5.1 violations');
    
    // Test good code
    const goodCode = `
      var x = 1;
      function test() { return 'good'; }
      logInfo('test');
    `;
    
    const goodViolations = validateES51Compliance(goodCode);
    assert.strictEqual(goodViolations.length, 0, 'should not detect violations in good code');
  });
});

describe('Project Templates', () => {
  test('migration script exists and is valid', async () => {
    const migrationPath = join(workspaceRoot, 'migrate-engie.js');
    const stat = await fs.stat(migrationPath);
    assert.ok(stat.isFile(), 'migration script should exist');
    
    const content = await fs.readFile(migrationPath, 'utf8');
    assert.ok(content.includes('migrateEngieProject'), 'should have migration function');
  });
});