/**
 * Clean Command - Clean build artifacts
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { findWorkspaceRoot, listAllProjects, findProject, log, success } from '../utils/workspace.js';

export async function cleanProjects(projectName) {
  if (projectName) {
    // Clean specific project
    await cleanProject(projectName);
  } else {
    // Clean all projects
    const projects = await listAllProjects();
    log(`🧹 Cleaning ${projects.length} projects...`);
    
    for (const project of projects) {
      await cleanProject(project);
    }
  }
  
  success('Clean completed!');
}

async function cleanProject(projectName) {
  try {
    const projectPath = await findProject(projectName);
    const distPath = join(projectPath, 'dist');
    
    try {
      await fs.rm(distPath, { recursive: true, force: true });
      log(`  🗑️  Cleaned ${projectName}/dist`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  } catch (err) {
    log(`  ⚠️  Failed to clean ${projectName}: ${err.message}`);
  }
}