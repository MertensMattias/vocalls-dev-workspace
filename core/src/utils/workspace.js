/**
 * Workspace Utilities
 * 
 * Helper functions for finding projects, logging, and workspace management
 */

import { promises as fs } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function findWorkspaceRoot() {
  let current = process.cwd();
  
  while (current !== dirname(current)) {
    try {
      const packagePath = join(current, 'package.json');
      const content = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);
      
      if (pkg.workspaces) {
        return current;
      }
    } catch {
      // Continue searching upward
    }
    
    current = dirname(current);
  }
  
  throw new Error('Workspace root not found. Make sure you are in a Vocalls workspace.');
}

export async function findProject(projectName) {
  const workspaceRoot = await findWorkspaceRoot();
  const projectPath = join(workspaceRoot, 'projects', projectName);
  
  try {
    const stat = await fs.stat(projectPath);
    if (!stat.isDirectory()) {
      throw new Error(`Project ${projectName} is not a directory`);
    }
    return projectPath;
  } catch (err) {
    throw new Error(`Project not found: ${projectName}`);
  }
}

export async function listAllProjects() {
  const workspaceRoot = await findWorkspaceRoot();
  const projectsDir = join(workspaceRoot, 'projects');
  
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name);
  } catch (err) {
    return [];
  }
}

export async function getProjectInfo(projectName) {
  const projectPath = await findProject(projectName);
  const configPath = join(projectPath, 'project.json');
  
  let config = {
    name: projectName,
    customer: 'Unknown',
    description: '',
    version: '1.0.0'
  };
  
  try {
    const content = await fs.readFile(configPath, 'utf8');
    config = { ...config, ...JSON.parse(content) };
  } catch {
    // Use defaults if config doesn't exist
  }
  
  return {
    ...config,
    path: projectPath
  };
}

export function log(...args) {
  if (!global.QUIET) {
    console.log(...args);
  }
}

export function verbose(...args) {
  if (global.VERBOSE) {
    console.log('🔍', ...args);
  }
}

export function error(...args) {
  console.error('❌', ...args);
}

export function success(...args) {
  if (!global.QUIET) {
    console.log('✅', ...args);
  }
}

export function warn(...args) {
  if (!global.QUIET) {
    console.warn('⚠️', ...args);
  }
}