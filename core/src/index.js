/**
 * Vocalls Core - Main exports
 * 
 * Provides programmatic access to the Vocalls development environment
 */

export { buildProject } from './commands/build.js';
export { simulateProject } from './commands/simulate.js';
export { debugProject } from './commands/debug.js';
export { createNewProject } from './commands/new.js';
export { cleanProjects } from './commands/clean.js';
export { listProjects, switchProject } from './commands/project.js';

export { VocallsSimulator } from './simulator/engine.js';
export { validateES51Compliance, validateVocallsGlobals } from './utils/validation.js';
export { 
  findWorkspaceRoot, 
  findProject, 
  listAllProjects, 
  getProjectInfo 
} from './utils/workspace.js';

// Version information
export const version = '2.0.0';