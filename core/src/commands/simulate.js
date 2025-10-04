/**
 * Simulate Command - Run project in Vocalls simulation environment
 * 
 * Provides ES5.1-compatible runtime simulation with mocked Vocalls APIs
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { findProject, getProjectInfo, log, error, success } from '../utils/workspace.js';
import { VocallsSimulator } from '../simulator/engine.js';

export async function simulateProject(projectName, options = {}) {
  try {
    const projectPath = await findProject(projectName);
    const projectInfo = await getProjectInfo(projectName);
    
    log(`🎮 Starting simulation: ${projectName}`);
    log(`   Script: ${options.script}`);
    log(`   Environment: ${options.env}`);
    log(`   HTTP Mode: ${options.mode}`);
    log(`   Storage Mode: ${options.storage}`);
    log();
    
    // Create simulator instance
    const simulator = new VocallsSimulator({
      projectPath,
      httpMode: options.mode,
      storageMode: options.storage,
      environment: options.env,
      verbose: global.VERBOSE
    });
    
    // Load and execute project
    const result = await simulator.execute(options.script);
    
    success('Simulation completed successfully!');
    log(`   Execution time: ${result.executionTime}ms`);
    log(`   Files loaded: ${result.filesLoaded}`);
    log(`   HTTP requests: ${result.httpRequests}`);
    log(`   Storage operations: ${result.storageOps}`);
    
    // Show session state summary
    if (result.sessionState) {
      log();
      log('📊 Session State Summary:');
      log(`   Variables: ${Object.keys(result.sessionState.variables || {}).length}`);
      log(`   Current segment: ${result.sessionState.variables?.segmentState?.currentSegment || 'Unknown'}`);
      log(`   Segment result: ${result.sessionState.variables?.segmentState?.segmentResult || 'Unknown'}`);
    }
    
    return result;
    
  } catch (err) {
    error(`Simulation failed: ${err.message}`);
    if (global.VERBOSE && err.stack) {
      console.error(err.stack);
    }
    throw err;
  }
}