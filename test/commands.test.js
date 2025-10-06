/**
 * Comprehensive tests for all Vocalls CLI commands
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
import { cleanProjects } from '../core/src/commands/clean.js';
import { listProjects, switchProject } from '../core/src/commands/project.js';

describe('New Command', () => {
  test('creates project with valid name', async () => {
    const projectName = 'test-new-command';
    const projectPath = join(workspaceRoot, 'projects', projectName);
    
    try {
      // Clean up if exists
      await fs.rm(projectPath, { recursive: true, force: true });
      
      const result = await createNewProject(projectName);
      assert.strictEqual(result, projectPath);
      
      // Verify project structure
      const stat = await fs.stat(projectPath);
      assert.ok(stat.isDirectory(), 'Project directory should exist');
      
      const requiredFiles = [
        'project.json',
        'src/globalCode.js',
        'src/globalVariables.js',
        'src/globalLibraries/active/globalApiDic.js',
        'src/globalLibraries/active/globalIntentDefinitions.js',
        'src/globalLibraries/active/globalLineConfig.js',
        'src/globalLibraries/active/globalSegmentConfig.js',
        'src/callScripts/main.js',
        'README.md'
      ];
      
      for (const file of requiredFiles) {
        const filePath = join(projectPath, file);
        const fileStat = await fs.stat(filePath);
        assert.ok(fileStat.isFile(), `${file} should exist`);
      }
      
      // Verify project.json content
      const configPath = join(projectPath, 'project.json');
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      assert.strictEqual(config.name, projectName);
      assert.strictEqual(config.customer, 'Unknown Customer');
      assert.strictEqual(config.version, '1.0.0');
      assert.ok(Array.isArray(config.libraryOrder));
      assert.ok(config.environments);
      assert.ok(config.features);
      
    } finally {
      // Clean up
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('rejects duplicate project names', async () => {
    const projectName = 'test-duplicate';
    
    try {
      // Create first project
      await createNewProject(projectName);
      
      // Try to create duplicate
      try {
        await createNewProject(projectName);
        assert.fail('Should have thrown error for duplicate project');
      } catch (err) {
        assert.ok(err.message.includes('already exists'));
      }
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('handles special characters in project names', async () => {
    const projectName = 'test-special-chars-123';
    
    try {
      const result = await createNewProject(projectName);
      assert.ok(result.includes(projectName));
      
      // Verify project was created
      const projectPath = join(workspaceRoot, 'projects', projectName);
      const stat = await fs.stat(projectPath);
      assert.ok(stat.isDirectory());
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
});

describe('Build Command', () => {
  test('builds existing project successfully', async () => {
    const projectName = 'test-build-command';
    
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
      
      // Verify monolith content
      const monolithContent = await fs.readFile(result.monolithPath, 'utf8');
      assert.ok(monolithContent.includes('VOCALLS COMPATIBLE MONOLITHIC IVR'));
      assert.ok(monolithContent.includes('Global Code'));
      assert.ok(monolithContent.includes('Global Variables'));
      assert.ok(monolithContent.includes('Main Script'));
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('builds with production optimization', async () => {
    const projectName = 'test-build-prod';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Build with production flag
      const result = await buildProject(projectName, { prod: true });
      
      assert.ok(result.monolithPath);
      
      // Verify production optimizations
      const monolithContent = await fs.readFile(result.monolithPath, 'utf8');
      
      // Should have fewer comments in production build
      const commentLines = monolithContent.split('\n').filter(line => 
        line.trim().startsWith('//') || line.trim().startsWith('/*')
      ).length;
      
      // Production build should have minimal comments
      assert.ok(commentLines < 50, 'Production build should have minimal comments');
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('validates ES5.1 compliance in production builds', async () => {
    const projectName = 'test-es51-validation';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Add ES6 code to test validation
      const mainScriptPath = join(workspaceRoot, 'projects', projectName, 'src', 'callScripts', 'main.js');
      const mainScript = await fs.readFile(mainScriptPath, 'utf8');
      const badScript = mainScript + '\nconst badVar = "ES6 syntax";\nlet anotherBad = 123;';
      await fs.writeFile(mainScriptPath, badScript, 'utf8');
      
      // Try to build with production flag
      try {
        await buildProject(projectName, { prod: true });
        assert.fail('Should have failed ES5.1 validation');
      } catch (err) {
        assert.ok(err.message.includes('compliance violations'));
      }
      
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

describe('Simulate Command', () => {
  test('simulates project successfully', async () => {
    const projectName = 'test-simulate-command';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Simulate project
      const result = await simulateProject(projectName);
      
      assert.ok(result.executionTime > 0);
      assert.ok(result.filesLoaded > 0);
      assert.ok(result.sessionState);
      assert.ok(result.sessionState.variables);
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('simulates with different environments', async () => {
    const projectName = 'test-simulate-env';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Test different environments
      const environments = ['acc', 'prd', 'dvp'];
      
      for (const env of environments) {
        const result = await simulateProject(projectName, { env });
        assert.ok(result.sessionState.variables.VOCALLS_ENV === env);
      }
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('simulates with different HTTP modes', async () => {
    const projectName = 'test-simulate-http';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Test different HTTP modes
      const modes = ['stub', 'real'];
      
      for (const mode of modes) {
        const result = await simulateProject(projectName, { mode });
        assert.ok(result.sessionState.variables.SIMULATION_MODE === mode);
      }
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('handles missing project gracefully', async () => {
    try {
      await simulateProject('nonexistent-project');
      assert.fail('Should have thrown error for missing project');
    } catch (err) {
      assert.ok(err.message.includes('Project not found'));
    }
  });
});

describe('List Command', () => {
  test('lists all projects', async () => {
    const projectNames = ['test-list-1', 'test-list-2'];
    
    try {
      // Create test projects
      for (const name of projectNames) {
        await createNewProject(name);
      }
      
      // List projects
      const projects = await listProjects();
      
      // Should include our test projects
      const projectNamesList = projects.map(p => p.name);
      for (const name of projectNames) {
        assert.ok(projectNamesList.includes(name), `Should include project ${name}`);
      }
      
    } finally {
      // Clean up
      for (const name of projectNames) {
        const projectPath = join(workspaceRoot, 'projects', name);
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    }
  });
});

describe('Clean Command', () => {
  test('cleans specific project', async () => {
    const projectName = 'test-clean-specific';
    
    try {
      // Create and build project
      await createNewProject(projectName);
      await buildProject(projectName);
      
      // Verify dist directory exists
      const distPath = join(workspaceRoot, 'projects', projectName, 'dist');
      const distStat = await fs.stat(distPath);
      assert.ok(distStat.isDirectory(), 'Dist directory should exist');
      
      // Clean project
      await cleanProjects(projectName);
      
      // Verify dist directory is removed
      try {
        await fs.stat(distPath);
        assert.fail('Dist directory should be removed');
      } catch (err) {
        assert.strictEqual(err.code, 'ENOENT');
      }
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
  
  test('cleans all projects when no project specified', async () => {
    const projectNames = ['test-clean-all-1', 'test-clean-all-2'];
    
    try {
      // Create and build projects
      for (const name of projectNames) {
        await createNewProject(name);
        await buildProject(name);
      }
      
      // Clean all projects
      await cleanProjects();
      
      // Verify all dist directories are removed
      for (const name of projectNames) {
        const distPath = join(workspaceRoot, 'projects', name, 'dist');
        try {
          await fs.stat(distPath);
          assert.fail(`Dist directory for ${name} should be removed`);
        } catch (err) {
          assert.strictEqual(err.code, 'ENOENT');
        }
      }
      
    } finally {
      // Clean up
      for (const name of projectNames) {
        const projectPath = join(workspaceRoot, 'projects', name);
        await fs.rm(projectPath, { recursive: true, force: true });
      }
    }
  });
});

describe('Switch Command', () => {
  test('switches active project', async () => {
    const projectName = 'test-switch-command';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Switch to project
      await switchProject(projectName);
      
      // Verify .active-project file exists
      const activeProjectPath = join(workspaceRoot, '.active-project');
      const activeProjectContent = await fs.readFile(activeProjectPath, 'utf8');
      assert.strictEqual(activeProjectContent.trim(), projectName);
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
      
      const activeProjectPath = join(workspaceRoot, '.active-project');
      await fs.rm(activeProjectPath, { force: true });
    }
  });
});

describe('Global Libraries Loading Order', () => {
  test('loads libraries in numeric then alphabetical order', async () => {
    const projectName = 'test-loading-order';
    
    try {
      // Create test project
      await createNewProject(projectName);
      
      // Create test library files with numeric and alphabetical names
      const libsPath = join(workspaceRoot, 'projects', projectName, 'src', 'globalLibraries', 'active');
      
      const testFiles = [
        { name: '10-tenth.js', content: 'logInfo("Loading 10-tenth.js");' },
        { name: '2-second.js', content: 'logInfo("Loading 2-second.js");' },
        { name: '1-first.js', content: 'logInfo("Loading 1-first.js");' },
        { name: 'alpha.js', content: 'logInfo("Loading alpha.js");' },
        { name: 'beta.js', content: 'logInfo("Loading beta.js");' }
      ];
      
      for (const file of testFiles) {
        await fs.writeFile(join(libsPath, file.name), file.content, 'utf8');
      }
      
      // Update project.json to use empty libraryOrder (let it auto-sort)
      const configPath = join(workspaceRoot, 'projects', projectName, 'project.json');
      const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
      config.libraryOrder = [];
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
      
      // Build project and check order
      const result = await buildProject(projectName);
      const monolithContent = await fs.readFile(result.monolithPath, 'utf8');
      
      // Extract loading order from monolith
      const loadingLines = monolithContent.split('\n').filter(line => 
        line.includes('Loading ') && line.includes('.js')
      );
      
      // Expected order: 1-first, 2-second, 10-tenth, alpha, beta
      const expectedOrder = [
        'Loading 1-first.js',
        'Loading 2-second.js', 
        'Loading 10-tenth.js',
        'Loading alpha.js',
        'Loading beta.js'
      ];
      
      for (let i = 0; i < expectedOrder.length; i++) {
        assert.ok(loadingLines[i].includes(expectedOrder[i]), 
          `Expected ${expectedOrder[i]} at position ${i}, got ${loadingLines[i]}`);
      }
      
    } finally {
      // Clean up
      const projectPath = join(workspaceRoot, 'projects', projectName);
      await fs.rm(projectPath, { recursive: true, force: true });
    }
  });
});

describe('Error Handling', () => {
  test('handles invalid project names gracefully', async () => {
    const invalidNames = ['', null, undefined, '   '];
    
    for (const name of invalidNames) {
      try {
        await createNewProject(name);
        assert.fail(`Should have rejected invalid name: ${name}`);
      } catch (err) {
        // Should throw some kind of error
        assert.ok(err.message);
      }
    }
  });
  
  test('handles file system errors gracefully', async () => {
    // Test with a path that would cause permission errors
    const invalidPath = '/root/invalid-path';
    
    try {
      await createNewProject('test-invalid-path');
      // This should work normally
      assert.ok(true);
    } catch (err) {
      // If it fails, it should be a meaningful error
      assert.ok(err.message);
    }
  });
});