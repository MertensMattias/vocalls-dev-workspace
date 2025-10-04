# Architecture Overview

## Design Principles

The Vocalls Development Environment v2 is built around these core principles:

### 1. **Pure JavaScript Guarantee**
- **No TypeScript**: All development tooling uses modern JavaScript (ES2022+)
- **No Transpilers**: Direct execution of JavaScript without build steps for the tooling itself  
- **No Complex Dependencies**: Minimal external dependencies, leveraging Node.js built-ins

### 2. **Clear Separation of Concerns**

```
core/           # Reusable development environment
├── bin/        # CLI entry point
├── src/        # Core functionality
│   ├── commands/      # CLI command implementations
│   ├── builder/       # Monolithic build system
│   ├── simulator/     # ES5.1 runtime simulation
│   └── utils/         # Shared utilities
└── package.json

projects/       # Customer-specific IVRs (isolated)
├── customer1/  # Independent project
├── customer2/  # Independent project  
└── template/   # New project template

docs/          # Documentation and guides
```

### 3. **Vocalls Loading Order Compliance**

The system strictly follows Vocalls runtime loading order:

1. **globalCode.js** - Core utilities and initialization
2. **globalVariables.js** - Global variable definitions
3. **globalLibraries/active/*.js** - Libraries in dependency order
4. **callScripts/main.js** - Main call script

### 4. **Multi-Project Architecture**

Each project is completely isolated:
- **Independent dependencies**: Project-specific configurations
- **Isolated builds**: Separate dist/ directories
- **Flexible configuration**: Per-project settings
- **Legacy compatibility**: Maintains existing structure

## Core Components

### CLI (voc)

The `voc` command provides all development operations:

```bash
voc new <name>      # Create new project
voc build <project> # Build to monolithic output
voc sim <project>   # Run simulation
voc debug <project> # Interactive debugging
voc clean [project] # Clean build artifacts
voc list           # List all projects
```

### Build System

**Deterministic dependency resolution**:
- Reads `project.json` for library order
- Concatenates files in correct sequence
- Validates ES5.1 compliance
- Generates monolithic output

**Output structure**:
```javascript
// Generated monolith structure
// ========================================
// VOCALLS COMPATIBLE MONOLITHIC IVR
// ========================================

// Global Code section
var environment = context.session.variables.VOCALLS_ENV || 'acc';
// ... globalCode.js content

// Global Variables section  
var API_BASE_URL = environment === 'prd' ? '...' : '...';
// ... globalVariables.js content

// Library sections (in dependency order)
// ========================================
// Library: globalApiDic.js
// ========================================
apiConfigMap.set('endpoint', { ... });
// ... library content

// Main Script section
// ========================================
// Main Script
// ========================================
logInfo('Starting call script...');
// ... main.js content
```

### Simulation Engine

**ES5.1-compliant sandbox**:
- Uses Node.js `vm` module for isolated execution
- Mocks all Vocalls APIs (`context`, `jsonHttpRequest`, `Storage`)
- Enforces ES5.1 restrictions (no let/const, arrow functions, etc.)
- Provides accurate runtime simulation

**Capabilities**:
- Memory or disk-based storage simulation
- HTTP request stubbing or proxying
- Session state persistence
- Performance metrics and logging

### ES5.1 Validation

**Compliance checking**:
- Scans for forbidden ES6+ syntax
- Validates Vocalls API usage
- Reports violations with line numbers
- Prevents deployment of non-compliant code

**Forbidden patterns**:
- `async/await`, `class`, `import/export`
- `let/const` (must use `var`)
- Template literals, arrow functions
- `Promise.catch()` (use `.then(success, error)`)
- `console.*` (use `logInfo/logWarn/logError`)

## Project Structure

### Standard Project Layout
```
projects/my-customer/
├── src/
│   ├── globalCode.js              # Core initialization
│   ├── globalVariables.js         # Global variable definitions
│   ├── globalLibraries/active/    # Active libraries
│   │   ├── globalApiDic.js       # API configurations
│   │   ├── globalIntentDefinitions.js
│   │   ├── globalLineConfig.js
│   │   └── globalSegmentConfig.js
│   └── callScripts/
│       └── main.js                # Main call script
├── dist/                          # Build output
├── workfiles/                     # Working files
├── project.json                   # Project configuration
└── README.md                      # Project documentation
```

### Configuration (`project.json`)
```json
{
  "name": "my-customer",
  "customer": "Customer Name", 
  "version": "1.0.0",
  "libraryOrder": [                // Dependency order
    "globalApiDic.js",
    "globalIntentDefinitions.js",
    "globalLineConfig.js", 
    "globalSegmentConfig.js"
  ],
  "environments": {
    "acc": { "apiBase": "...", "schedulerId": 123 },
    "prd": { "apiBase": "...", "schedulerId": 456 }
  },
  "features": {
    "intentDetection": true,
    "cdbLogging": true
  }
}
```

## Development Workflow

### 1. Create New Project
```bash
voc new my-customer
```
- Scaffolds complete project structure
- Creates template files with examples
- Sets up configuration files

### 2. Development
- Edit files in `src/` directories
- Maintain Vocalls coding patterns
- Use ES5.1 compatible syntax

### 3. Testing
```bash
voc sim my-customer --env acc --mode stub
```
- Runs in isolated ES5.1 sandbox
- Mocks Vocalls APIs
- Provides detailed logging

### 4. Building
```bash
voc build my-customer --prod
```
- Validates ES5.1 compliance
- Generates monolithic output
- Optimizes for production

### 5. Debugging (Future)
```bash
voc debug my-customer
```
- Interactive step-through debugging
- Variable inspection
- Breakpoint support

## Legacy Compatibility

The system maintains compatibility with existing Vocalls development practices:

### Project Switching
```bash
voc switch my-customer
```
Creates `.active-project` marker for tools that expect a single active project.

### File Structure
Projects maintain the familiar `globalLibraries/active/` structure while allowing modern organization.

### Export Format
Monolithic output is 100% compatible with existing Vocalls deployment processes.

## Benefits

### For Development
- **Modern tooling** with pure JavaScript
- **Multi-project support** without conflicts
- **Fast development cycles** with simulation
- **Reliable builds** with validation

### For Operations  
- **Single-file deployment** to Vocalls
- **Deterministic builds** with dependency ordering
- **ES5.1 compliance** guaranteed
- **Legacy compatibility** preserved

### For Maintenance
- **Clear project separation** reduces conflicts
- **Standardized structure** across projects
- **Documentation-driven** development
- **Version control friendly** file organization