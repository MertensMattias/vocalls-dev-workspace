#!/usr/bin/env node

/**
 * Vocalls Development CLI
 * 
 * Commands:
 * - new <name>      Create new project from template
 * - build <project> Build project to monolithic output
 * - sim <project>   Run project in simulation
 * - debug <project> Run project with interactive debugging
 * - clean [project] Clean build artifacts
 * - list           List all projects
 * - switch <project> Switch active project for legacy compatibility
 */

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get package info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = join(__dirname, '..', 'package.json');
const packageInfo = JSON.parse(readFileSync(packagePath, 'utf8'));

const program = new Command();

program
  .name('voc')
  .description('Vocalls development environment CLI')
  .version(packageInfo.version);

// Import command handlers
import { createNewProject } from '../src/commands/new.js';
import { buildProject } from '../src/commands/build.js';
import { simulateProject } from '../src/commands/simulate.js';
import { debugProject } from '../src/commands/debug.js';
import { cleanProjects } from '../src/commands/clean.js';
import { listProjects, switchProject } from '../src/commands/project.js';

program
  .command('new')
  .description('Create new Vocalls project from template')
  .argument('<name>', 'project name')
  .option('-t, --template <template>', 'template to use', 'default')
  .action(createNewProject);

program
  .command('build')
  .description('Build project to monolithic output')
  .argument('<project>', 'project name')
  .option('--prod', 'production build (optimized)')
  .option('--clean', 'clean before build')
  .action(buildProject);

program
  .command('sim')
  .description('Run project in simulation environment')
  .argument('<project>', 'project name')
  .option('--script <script>', 'specific script to run', 'main')
  .option('--env <env>', 'environment (acc|prd|dvp)', 'acc')
  .option('--mode <mode>', 'HTTP mode (real|stub)', 'stub')
  .option('--storage <storage>', 'storage mode (disk|memory)', 'memory')
  .action(simulateProject);

program
  .command('debug')
  .description('Run project with interactive debugging')
  .argument('<project>', 'project name')
  .option('--script <script>', 'specific script to run', 'main')
  .option('--env <env>', 'environment (acc|prd|dvp)', 'acc')
  .option('--breakpoints <file>', 'breakpoints file')
  .action(debugProject);

program
  .command('clean')
  .description('Clean build artifacts')
  .argument('[project]', 'project name (all if omitted)')
  .action(cleanProjects);

program
  .command('list')
  .description('List all projects')
  .option('--active', 'show active project only')
  .action(listProjects);

program
  .command('switch')
  .description('Switch active project (legacy compatibility)')
  .argument('<project>', 'project name')
  .action(switchProject);

// Global options
program
  .option('--verbose', 'verbose output')
  .option('--quiet', 'quiet output')
  .hook('preAction', (thisCommand, actionCommand) => {
    // Set global logging level based on options
    const options = thisCommand.opts();
    global.VERBOSE = options.verbose;
    global.QUIET = options.quiet;
  });

program.parse();