/**
 * Project Management Commands - List and switch projects
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { listAllProjects, getProjectInfo, findWorkspaceRoot, log, success } from '../utils/workspace.js';

export async function listProjects(options = {}) {
  const projects = await listAllProjects();
  
  if (projects.length === 0) {
    log('No projects found in workspace.');
    log('Create a new project with: voc new <project-name>');
    return;
  }
  
  log(`📋 Found ${projects.length} projects:`);
  log();
  
  for (const projectName of projects) {
    try {
      const info = await getProjectInfo(projectName);
      const activeMarker = await isActiveProject(projectName) ? '✅' : '  ';
      
      log(`${activeMarker} ${info.name}`);
      log(`   Customer: ${info.customer}`);
      log(`   Version: ${info.version}`);
      log(`   Path: ${info.path}`);
      
      if (info.description) {
        log(`   Description: ${info.description}`);
      }
      
      log();
    } catch (err) {
      log(`  ❌ ${projectName} (invalid project)`);
    }
  }
}

export async function switchProject(projectName) {
  try {
    const workspaceRoot = await findWorkspaceRoot();
    const projectInfo = await getProjectInfo(projectName);
    
    // Create active project marker for legacy compatibility
    const activeMarker = {
      project: projectName,
      switchedAt: new Date().toISOString(),
      customer: projectInfo.customer,
      version: projectInfo.version
    };
    
    const markerPath = join(workspaceRoot, '.active-project');
    await fs.writeFile(markerPath, JSON.stringify(activeMarker, null, 2), 'utf8');
    
    success(`Switched to project: ${projectName}`);
    log(`   This project is now marked as active for legacy compatibility`);
    log(`   Run: voc sim ${projectName}`);
    
  } catch (err) {
    throw new Error(`Failed to switch project: ${err.message}`);
  }
}

async function isActiveProject(projectName) {
  try {
    const workspaceRoot = await findWorkspaceRoot();
    const markerPath = join(workspaceRoot, '.active-project');
    const content = await fs.readFile(markerPath, 'utf8');
    const marker = JSON.parse(content);
    return marker.project === projectName;
  } catch {
    return false;
  }
}