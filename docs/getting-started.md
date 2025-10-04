# Getting Started

Welcome to the Vocalls Development Environment v2! This guide will help you set up and start using the new multi-project workspace.

## Prerequisites

- **Node.js ≥18.18.0**: Download from [nodejs.org](https://nodejs.org/)
- **npm ≥8.0.0**: Usually included with Node.js
- **Windows**: The environment is designed for Windows development

## Installation

### 1. Clone or Create Workspace

```bash
# If starting fresh
mkdir vocalls-dev-workspace
cd vocalls-dev-workspace
git init

# If migrating from existing environment
# (Use the provided migration script)
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# This will install:
# - Core development tools
# - CLI utilities  
# - Code formatting tools
# - Git hooks
```

### 3. Verify Installation

```bash
# Check that the CLI is working
npx voc --version

# Should display version information
```

## Migrating Existing Projects

If you have an existing Vocalls project, use the migration script:

```bash
# Run the Engie project migration script
node migrate-engie.js

# Or manually create projects and copy files
```

## Your First Project

### Create New Project

```bash
# Create a new project
npx voc new hello-world

# This creates:
# - projects/hello-world/
# - Complete project structure  
# - Template files with examples
# - Configuration files
```

### Project Structure

```
projects/hello-world/
├── src/
│   ├── globalCode.js              # Core utilities (loaded first)
│   ├── globalVariables.js         # Global variables  
│   ├── globalLibraries/active/    # Global libraries
│   │   ├── globalApiDic.js       # API configuration
│   │   ├── globalIntentDefinitions.js  # Intent definitions
│   │   ├── globalLineConfig.js   # Line configuration
│   │   └── globalSegmentConfig.js  # Segment configuration
│   └── callScripts/
│       └── main.js                # Main call script (loaded last)
├── dist/                          # Build output
├── workfiles/                     # Working files
├── project.json                   # Project configuration
└── README.md                      # Project documentation
```

### Build Your Project

```bash
# Build the project to monolithic output
npx voc build hello-world

# This creates:
# - dist/hello-world.monolith.js (ready for Vocalls deployment)
# - Validates ES5.1 compliance
# - Follows Vocalls loading order
```

### Run Simulation

```bash
# Run in simulation environment
npx voc sim hello-world

# With options:
npx voc sim hello-world --env acc --mode stub --storage memory

# Options:
#   --env: acc|prd|dvp (default: acc)
#   --mode: real|stub (default: stub)  
#   --storage: disk|memory (default: memory)
```

### List Projects

```bash
# List all projects
npx voc list

# Shows:
# - Project names
# - Customer information
# - Versions
# - Active status
```

## Development Workflow

### 1. Edit Your Code

Open your project files in your favorite editor:

```bash
# Using VS Code
code projects/hello-world/

# Edit files in src/ directories:
# - src/globalCode.js - Core utilities
# - src/globalVariables.js - Global variables
# - src/globalLibraries/active/*.js - Libraries  
# - src/callScripts/main.js - Main script
```

### 2. Test with Simulation

```bash
# Quick test
npx voc sim hello-world

# With verbose logging
npx voc sim hello-world --verbose

# Different environment
npx voc sim hello-world --env prd --mode real
```

### 3. Build for Production

```bash
# Development build
npx voc build hello-world

# Production build (optimized + validated)
npx voc build hello-world --prod

# Clean first
npx voc build hello-world --prod --clean
```

### 4. Deploy

Copy the monolithic file to Vocalls:

```bash
# The file is ready for Vocalls deployment:
# projects/hello-world/dist/hello-world.monolith.js
```

## Configuration

### Project Configuration (`project.json`)

```json
{
  "name": "hello-world",
  "customer": "Customer Name",
  "version": "1.0.0",
  "libraryOrder": [
    "globalApiDic.js",
    "globalIntentDefinitions.js", 
    "globalLineConfig.js",
    "globalSegmentConfig.js"
  ],
  "environments": {
    "acc": {
      "apiBase": "https://api-acc.example.com",
      "schedulerId": 123
    },
    "prd": {
      "apiBase": "https://api.example.com", 
      "schedulerId": 456
    }
  },
  "features": {
    "intentDetection": true,
    "cdbLogging": true,
    "segmentLogging": true
  }
}
```

### Workspace Configuration

The workspace uses npm workspaces for dependency management:

```json
{
  "workspaces": [
    "core",
    "projects/*" 
  ]
}
```

## Common Commands

```bash
# Project Management
npx voc new <name>              # Create new project
npx voc list                    # List all projects
npx voc switch <project>        # Switch active project (legacy)

# Development  
npx voc build <project>         # Build project
npx voc sim <project>           # Run simulation
npx voc debug <project>         # Debug (future)
npx voc clean [project]         # Clean build artifacts

# Maintenance
npm run lint                    # Lint all code
npm run format                  # Format all code  
npm test                        # Run tests
```

## File Organization Tips

### Global Code Structure

```javascript
// src/globalCode.js - Core utilities
var environment = context.session.variables.VOCALLS_ENV || 'acc';

function initializeCallFlowContext() {
    // Setup varObj and segmentState
}

function isValidObject(obj) {
    return obj && typeof obj === 'object' && obj !== null;
}
```

### Global Variables

```javascript  
// src/globalVariables.js - Global variables
var API_BASE_URL = environment === 'prd' ? 'https://api.example.com' : 'https://api-acc.example.com';
var lineMap = new Map();
var segmentDic = new Map();
```

### Libraries

Keep each library focused on a single responsibility:
- `globalApiDic.js` - API endpoint configurations
- `globalIntentDefinitions.js` - Intent recognition patterns  
- `globalLineConfig.js` - Phone line configurations
- `globalSegmentConfig.js` - Call flow segment definitions

### Main Script

```javascript
// src/callScripts/main.js - Entry point  
logInfo('Starting call script');
initializeCallFlowContext();

// Your call handling logic here...
```

## ES5.1 Compliance

Remember that Vocalls uses ES5.1, so avoid:

```javascript
// ❌ Not allowed
const x = 1;              // Use var instead
let y = 2;                // Use var instead  
() => {}                  // Use function() {}
`template ${string}`;     // Use string concatenation
promise.catch()           // Use .then(success, error)
console.log()             // Use logInfo()

// ✅ Allowed
var x = 1;
function handler() {}
'string' + variable;
promise.then(success, error);
logInfo('message');
```

## Getting Help

- **Documentation**: Check `docs/` directory
- **Examples**: Look at generated project templates  
- **Issues**: Report problems via your issue tracker
- **CLI Help**: Run `npx voc --help`

## Next Steps

1. **Create your first project**: `npx voc new my-project`
2. **Explore the template files**: See how they're structured
3. **Run a simulation**: `npx voc sim my-project`
4. **Build for production**: `npx voc build my-project --prod`
5. **Read the architecture guide**: `docs/architecture.md`

Happy coding! 🎉