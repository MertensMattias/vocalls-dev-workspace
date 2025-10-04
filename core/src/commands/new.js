/**
 * New Command - Create new Vocalls project from template
 * 
 * Creates a new project with proper Vocalls structure:
 * - src/globalCode.js
 * - src/globalVariables.js  
 * - src/globalLibraries/active/
 * - src/callScripts/main.js
 * - project.json configuration
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { findWorkspaceRoot, log, error, success } from '../utils/workspace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createNewProject(projectName, options = {}) {
  try {
    const workspaceRoot = await findWorkspaceRoot();
    const projectPath = join(workspaceRoot, 'projects', projectName);
    
    // Check if project already exists
    try {
      await fs.access(projectPath);
      throw new Error(`Project ${projectName} already exists`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    
    log(`🏗️  Creating new Vocalls project: ${projectName}`);
    
    // Create project structure
    await createProjectStructure(projectPath);
    
    // Create project configuration
    await createProjectConfig(projectPath, projectName, options);
    
    // Create template files
    await createTemplateFiles(projectPath, projectName);
    
    success(`Project created successfully!`);
    log(`   Location: ${projectPath}`);
    log(`   Next steps:`);
    log(`     voc build ${projectName}    # Build the project`);
    log(`     voc sim ${projectName}      # Run simulation`);
    log(`     voc debug ${projectName}    # Debug interactively`);
    
    return projectPath;
    
  } catch (err) {
    error(`Failed to create project: ${err.message}`);
    throw err;
  }
}

async function createProjectStructure(projectPath) {
  const directories = [
    '',
    'src',
    'src/globalLibraries',
    'src/globalLibraries/active',
    'src/callScripts',
    'dist',
    'workfiles'
  ];
  
  for (const dir of directories) {
    const fullPath = join(projectPath, dir);
    await fs.mkdir(fullPath, { recursive: true });
    log(`  📁 Created ${dir || 'project root'}`);
  }
}

async function createProjectConfig(projectPath, projectName, options) {
  const config = {
    name: projectName,
    customer: options.customer || 'Unknown Customer',
    description: `Vocalls IVR project for ${projectName}`,
    version: '1.0.0',
    created: new Date().toISOString(),
    libraryOrder: [
      'globalApiDic.js',
      'globalIntentDefinitions.js',
      'globalLineConfig.js',
      'globalSegmentConfig.js'
    ],
    environments: {
      acc: {
        apiBase: 'https://api.example.com',
        schedulerId: null
      },
      prd: {
        apiBase: 'https://api.example.com',
        schedulerId: null
      }
    },
    features: {
      intentDetection: true,
      cdbLogging: true,
      segmentLogging: true
    }
  };
  
  const configPath = join(projectPath, 'project.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  log(`  📝 Created project.json`);
}

async function createTemplateFiles(projectPath, projectName) {
  // Create globalCode.js
  const globalCode = `/**
 * Global Code for ${projectName}
 * 
 * Core utilities and initialization functions
 * Loaded first in the Vocalls runtime
 */

// Vocalls environment detection
var environment = context.session.variables.VOCALLS_ENV || 'acc';
var lineIdentificator = context.settings.lineIdentificator;
var moduleName = context.settings.moduleName;
var language = context.language.substring(0, 2).toUpperCase() || 'NL';

// Core variables
var interactionStartTime;
var callIdKey = null;
var isValidSource = false;

// Context variables
var varObj = {};
var segmentState = {};
var currentSegment = '';
var segmentResult = '';

/**
 * Initialize call flow context
 * Sets up varObj and segmentState in context.session.variables
 */
function initializeCallFlowContext() {
    logInfo('Initializing call flow context');
    
    // Initialize varObj if not exists
    if (!isValidObject(context.session.variables.varObj)) {
        context.session.variables.varObj = {};
    }
    varObj = context.session.variables.varObj;
    
    // Initialize segmentState if not exists  
    if (!isValidObject(context.session.variables.segmentState)) {
        context.session.variables.segmentState = {
            currentSegment: 'INIT',
            segmentResult: '',
            previousSegment: '',
            params: {},
            log: []
        };
    }
    segmentState = context.session.variables.segmentState;
}

/**
 * Utility function to check if object is valid
 */
function isValidObject(obj) {
    return obj && typeof obj === 'object' && obj !== null;
}

/**
 * Get current UTC timestamp
 */
function nowUTC() {
    return new Date().toISOString();
}`;
  
  await fs.writeFile(join(projectPath, 'src', 'globalCode.js'), globalCode, 'utf8');
  log(`  📝 Created src/globalCode.js`);
  
  // Create globalVariables.js
  const globalVariables = `/**
 * Global Variables for ${projectName}
 * 
 * Global variable definitions and constants
 * Loaded after globalCode.js
 */

// Environment configuration
var API_BASE_URL = environment === 'prd' ? 'https://api.example.com' : 'https://api-acc.example.com';
var SCHEDULER_ID = null; // Set based on environment

// Line configuration maps
var lineMap = new Map();
var segmentDic = new Map();
var apiConfigMap = new Map();
var intentDefinitions = {};

// Logging configuration
var logVarActive = true;
var logSegmentActive = true; 
var logCdbActive = true;
var useLLMIntentDetection = false;

// Runtime variables
var gsSchedulerId = null;
var routingId = null;
var customerName = '';
var customerProject = '';
var defaultKeysToLog = [];
var addKeysToLog = [];`;

  await fs.writeFile(join(projectPath, 'src', 'globalVariables.js'), globalVariables, 'utf8');
  log(`  📝 Created src/globalVariables.js`);
  
  // Create sample global libraries
  await createSampleLibraries(projectPath, projectName);
  
  // Create main.js
  const mainScript = `/**
 * Main Call Script for ${projectName}
 * 
 * Entry point for call handling logic
 * Loaded last in the Vocalls runtime
 */

logInfo('Starting ${projectName} call script');
logInfo('Line Identificator:', lineIdentificator);
logInfo('Environment:', environment);

// Initialize timing
interactionStartTime = nowUTC();
logInfo('Interaction start time:', interactionStartTime);

// Initialize context
initializeCallFlowContext();

// Get line configuration
var lineData = lineMap.get(lineIdentificator);

if (isValidObject(lineData)) {
    logInfo('Line data found for:', lineIdentificator);
    isValidSource = true;
    
    // Extract line configuration
    routingId = lineData.routingId;
    customerName = lineData.customerName;
    customerProject = lineData.customerProject;
    
    // Initialize segment state if needed
    if (!isValidObject(segmentState.currentSegment)) {
        segmentState.currentSegment = 'WELCOME';
        segmentState.segmentResult = '';
    }
    
} else {
    logError('Line data not found for:', lineIdentificator);
    isValidSource = false;
    
    // Set error segment
    segmentState = {
        currentSegment: 'ERROR_INVALID_LINE',
        segmentResult: 'INVALID_LINE',
        params: {},
        log: []
    };
}

// Update context with current state
context.session.variables.varObj = varObj;
context.session.variables.segmentState = segmentState;

logInfo('Call script initialization completed');
logInfo('Current segment:', segmentState.currentSegment);
logInfo('Segment result:', segmentState.segmentResult);`;

  await fs.writeFile(join(projectPath, 'src', 'callScripts', 'main.js'), mainScript, 'utf8');
  log(`  📝 Created src/callScripts/main.js`);
  
  // Create README
  const readme = `# ${projectName}

Vocalls IVR project created on ${new Date().toLocaleDateString()}.

## Structure

\`\`\`
src/
├── globalCode.js              # Core utilities (loaded first)
├── globalVariables.js         # Global variables
├── globalLibraries/active/    # Global libraries
│   ├── globalApiDic.js       # API configuration
│   ├── globalIntentDefinitions.js  # Intent definitions
│   ├── globalLineConfig.js   # Line configuration
│   └── globalSegmentConfig.js  # Segment configuration
└── callScripts/main.js        # Main call script (loaded last)
\`\`\`

## Commands

\`\`\`bash
# Build monolithic output
voc build ${projectName}

# Run simulation
voc sim ${projectName}

# Debug interactively  
voc debug ${projectName}

# Clean build artifacts
voc clean ${projectName}
\`\`\`

## Configuration

Edit \`project.json\` to configure:
- Customer information
- Environment settings
- Library loading order
- Feature flags
`;

  await fs.writeFile(join(projectPath, 'README.md'), readme, 'utf8');
  log(`  📝 Created README.md`);
}

async function createSampleLibraries(projectPath, projectName) {
  const libsPath = join(projectPath, 'src', 'globalLibraries', 'active');
  
  // Create globalApiDic.js
  const apiDic = `/**
 * API Dictionary for ${projectName}
 * 
 * API endpoint and configuration definitions
 */

// API configuration map
apiConfigMap.set('customerLookup', {
    endpoint: API_BASE_URL + '/customer/lookup',
    method: 'POST',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

apiConfigMap.set('scheduleCallback', {
    endpoint: API_BASE_URL + '/callback/schedule', 
    method: 'POST',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

logInfo('API configuration loaded, endpoints:', apiConfigMap.size);`;
  
  await fs.writeFile(join(libsPath, 'globalApiDic.js'), apiDic, 'utf8');
  log(`    📝 Created globalApiDic.js`);
  
  // Create other sample libraries
  const libraries = [
    {
      name: 'globalIntentDefinitions.js',
      content: `/**
 * Intent Definitions for ${projectName}
 */

intentDefinitions = {
    greeting: {
        patterns: ['hello', 'hi', 'good morning', 'good afternoon'],
        confidence: 0.8
    },
    help: {
        patterns: ['help', 'support', 'assistance'],
        confidence: 0.9
    },
    goodbye: {
        patterns: ['bye', 'goodbye', 'thank you', 'thanks'],
        confidence: 0.7
    }
};

logInfo('Intent definitions loaded:', Object.keys(intentDefinitions).length);`
    },
    {
      name: 'globalLineConfig.js', 
      content: `/**
 * Line Configuration for ${projectName}
 */

// Sample line configuration
lineMap.set('${projectName.toUpperCase()}_MAIN', {
    routingId: 1001,
    customerName: '${projectName}',
    customerProject: '${projectName.toUpperCase()}',
    environment: environment,
    operations: [{
        params: {
            schedulerId: SCHEDULER_ID,
            useLLMIntentDetection: false,
            logVarActive: true,
            logSegmentActive: true,
            logCdbActive: true
        }
    }]
});

logInfo('Line configuration loaded, lines:', lineMap.size);`
    },
    {
      name: 'globalSegmentConfig.js',
      content: `/**
 * Segment Configuration for ${projectName}
 */

// Define segment transitions
segmentDic.set('INIT', {
    nextSegments: {
        'START': 'WELCOME',
        'ERROR': 'ERROR_HANDLER'
    },
    actions: ['initializeCall']
});

segmentDic.set('WELCOME', {
    nextSegments: {
        'CONTINUE': 'MENU',
        'HELP': 'HELP',
        'END': 'GOODBYE'
    },
    actions: ['playWelcome', 'detectIntent']
});

segmentDic.set('MENU', {
    nextSegments: {
        'OPTION_1': 'OPTION_1_HANDLER',
        'OPTION_2': 'OPTION_2_HANDLER',
        'HELP': 'HELP',
        'END': 'GOODBYE'
    },
    actions: ['playMenu', 'captureInput']
});

segmentDic.set('GOODBYE', {
    nextSegments: {},
    actions: ['playGoodbye', 'endCall']
});

segmentDic.set('ERROR_HANDLER', {
    nextSegments: {
        'RETRY': 'WELCOME',
        'END': 'GOODBYE'
    },
    actions: ['playError', 'logError']
});

logInfo('Segment configuration loaded, segments:', segmentDic.size);`
    }
  ];
  
  for (const lib of libraries) {
    await fs.writeFile(join(libsPath, lib.name), lib.content, 'utf8');
    log(`    📝 Created ${lib.name}`);
  }
}