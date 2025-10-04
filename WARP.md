# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

This is a **Vocalls Development Environment v2** - a multi-project workspace for developing call center IVR scripts in JavaScript ES5.1 for the Vocalls platform. The key constraint is that output code must be ES5.1 compatible (no TypeScript, no modern JavaScript features) while the development environment uses modern ES2022+ tooling.

### Key Principles
- **Pure JavaScript**: No TypeScript, no transpilers, modern ES2022+ development with ES5.1 output
- **Multi-Project Architecture**: Each customer/IVR is completely isolated in `projects/`
- **Vocalls Runtime Compatibility**: Strict ES5.1 compliance with mocked Vocalls APIs for local simulation
- **Monolithic Output**: Single-file deployment ready for Vocalls platform

## Essential Commands

### Project Management
```bash
# List all projects
npx voc list

# Create new project
npx voc new customer-name

# Build project to monolithic output (required before Vocalls deployment)
npx voc build project-name --prod

# Run local simulation with Vocalls API mocking
npx voc sim project-name --env acc --verbose

# Clean build artifacts
npx voc clean project-name
```

### Development Workflow
```bash
# Install dependencies
npm install

# Lint and format code
npm run lint
npm run format

# Run tests
npm test

# Quick development cycle
npx voc build my-project && npx voc sim my-project --verbose
```

## Repository Architecture

```
vocalls-dev-workspace/
├── core/                    # Reusable development tools
│   ├── bin/voc.mjs         # CLI entry point
│   ├── src/
│   │   ├── commands/       # CLI command implementations
│   │   ├── builder/        # Monolithic build system
│   │   ├── simulator/      # ES5.1 runtime simulation engine
│   │   └── utils/          # Validation and workspace utilities
│   └── package.json        # Core tooling dependencies
├── projects/               # Customer IVR projects (isolated)
│   ├── customer-a/         # Independent project
│   └── customer-b/         # Independent project
├── docs/                   # Architecture and CLI documentation
└── migrate-engie.js        # Legacy project migration script
```

### Project Structure (Critical for Vocalls Loading Order)
Each project follows strict Vocalls loading sequence:

```
projects/my-customer/
├── src/
│   ├── globalCode.js              # 1. Core initialization (loaded first)
│   ├── globalVariables.js         # 2. Global variable definitions
│   ├── globalLibraries/active/    # 3. Libraries in dependency order
│   │   ├── globalApiDic.js
│   │   ├── globalIntentDefinitions.js
│   │   ├── globalLineConfig.js
│   │   └── globalSegmentConfig.js
│   └── callScripts/main.js        # 4. Main call script (loaded last)
├── dist/                          # Build output
│   └── my-customer.monolith.js    # Single-file deployment
├── project.json                   # Project configuration
└── README.md
```

## Vocalls Runtime Constraints

### ES5.1 Compliance (Critical)
**Forbidden Syntax (will break in Vocalls):**
```javascript
// ❌ Modern JavaScript - NOT ALLOWED
const result = getData();           // Use var
let value = processData();          // Use var  
() => 'arrow function';             // Use function()
`template ${string}`;              // Use string concatenation
promise.catch(error);              // Use .then(success, error)
console.log('message');            // Use logInfo()
class MyClass {}                   // Not supported
import/export                      // Not supported
async/await                        // Not supported
```

**Allowed ES5.1 Patterns:**
```javascript
// ✅ Vocalls-compatible code
var result = processData();
function handleResponse() { return 'success'; }
var promise = jsonHttpRequest(config).then(function(success) {
  logInfo('Success:', success);
  return success;
}, function(error) {
  logError('Error:', error);
  return { success: false, error: error };
});
```

### Context and Session Variables (Critical Pattern)
```javascript
// Vocalls provides global 'context' object
var environment = context.session.variables.VOCALLS_ENV || 'acc';

// ONLY write to context.session.variables (reading elsewhere is forbidden)
context.session.variables.varObj = {
  customerId: '12345',
  currentStep: 'WELCOME'
};

context.session.variables.segmentState = {
  currentSegment: 'INIT',
  segmentResult: '',
  log: []
};

context.session.variables.config_store = {
  apiBaseUrl: environment === 'prd' ? 'https://api.example.com' : 'https://api-acc.example.com'
};
```

### Available APIs
```javascript
// Logging (instead of console)
logInfo('Message', data);
logWarn('Warning', data);
logError('Error', data);

// HTTP requests (async)
jsonHttpRequest({
  url: 'https://api.example.com/endpoint',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(function(response) {
  if (response.success) {
    logInfo('API Success:', response.data);
  }
}, function(error) {
  logError('API Error:', error);
});

// Storage operations
var writeResult = Storage.writeFile('logs/call.json', JSON.stringify(data));
var readResult = Storage.readFile('logs/call.json');
```

## Build System Deep Dive

The build system concatenates files in Vocalls loading order and validates ES5.1 compliance:

1. **Dependency Resolution**: Uses `project.json` `libraryOrder` array
2. **ES5.1 Validation**: Scans for forbidden syntax patterns
3. **Monolithic Output**: Single `.monolith.js` file with section headers
4. **Environment Integration**: Injects environment-specific configuration

### Build Output Structure
```javascript
// ========================================
// VOCALLS COMPATIBLE MONOLITHIC IVR
// ========================================

// Global Code section
var environment = context.session.variables.VOCALLS_ENV || 'acc';
// ... globalCode.js content

// Global Variables section  
var API_BASE_URL = environment === 'prd' ? '...' : '...';
// ... globalVariables.js content

// ========================================
// Library: globalApiDic.js
// ========================================
// ... library content in dependency order

// ========================================
// Main Script
// ========================================
logInfo('Starting call script...');
// ... main.js content
```

## Simulation Environment

The simulator provides accurate ES5.1 runtime with mocked Vocalls APIs:

```bash
# Different simulation modes
npx voc sim my-project --env acc --mode stub --storage memory --verbose
npx voc sim my-project --env prd --mode real --storage disk
```

**Environment Variables in Simulation:**
- `--env acc|prd|dvp`: Sets `context.session.variables.VOCALLS_ENV`
- `--mode stub|real`: Controls HTTP request behavior (stub returns mocked responses)
- `--storage memory|disk`: Storage persistence mode

## Testing Strategy

### ES5.1 Compliance Testing
```bash
# Validate before deployment
npx voc build my-project --prod
# Will report any ES5.1 violations with line numbers
```

### Simulation Testing
```bash
# Test different environments
npx voc sim my-project --env acc --verbose
npx voc sim my-project --env prd --verbose

# Test with different configurations
npx voc sim my-project --env acc --mode stub    # Fast testing
npx voc sim my-project --env prd --mode real    # Production-like
```

### Code Pattern Testing
```javascript
// Test segment state transitions
function testSegmentFlow() {
  var testCases = [
    { input: 'WELCOME', expected: 'MENU' },
    { input: 'MENU', expected: 'OPTION_1' },
    { input: 'ERROR', expected: 'WELCOME' }
  ];
  
  testCases.forEach(function(testCase) {
    context.session.variables.segmentState.currentSegment = testCase.input;
    var result = processSegmentTransition();
    logInfo('Test:', testCase.input, '=>', result, '(expected:', testCase.expected + ')');
  });
}
```

## Common Patterns

### Error Handling
```javascript
function safeApiCall(config) {
  return jsonHttpRequest(config).then(function(response) {
    if (!response.success) {
      logError('API call failed:', response.error);
      return { success: false, error: response.error };
    }
    return response;
  }, function(error) {
    logError('Request error:', error.message);
    return { success: false, error: error.message };
  });
}
```

### Environment Configuration
```javascript
function getEnvironmentConfig() {
  var env = context.session.variables.VOCALLS_ENV || 'acc';
  var configs = {
    acc: { apiBase: 'https://api-acc.example.com', schedulerId: 123 },
    prd: { apiBase: 'https://api.example.com', schedulerId: 456 },
    dvp: { apiBase: 'https://dev-api.example.com', schedulerId: 789 }
  };
  return configs[env] || configs.acc;
}
```

### Session State Management
```javascript
function initializeSession() {
  if (!context.session.variables.varObj) {
    context.session.variables.varObj = {};
  }
  if (!context.session.variables.segmentState) {
    context.session.variables.segmentState = {
      currentSegment: 'INIT',
      segmentResult: '',
      history: []
    };
  }
}
```

## Project Configuration

Each project has a `project.json` with critical settings:

```json
{
  "name": "my-customer",
  "customer": "Customer Name",
  "libraryOrder": [
    "globalApiDic.js",
    "globalIntentDefinitions.js", 
    "globalLineConfig.js",
    "globalSegmentConfig.js"
  ],
  "environments": {
    "acc": { "apiBase": "https://api-acc.example.com", "schedulerId": 123 },
    "prd": { "apiBase": "https://api.example.com", "schedulerId": 456 }
  },
  "features": {
    "intentDetection": true,
    "cdbLogging": true
  }
}
```

## Debugging

### Verbose Logging
```bash
npx voc build my-project --verbose    # Detailed build output
npx voc sim my-project --verbose      # Detailed simulation logs
```

### Common Issues
- **ES5.1 violations**: Use `--verbose` to see exact line numbers and forbidden patterns
- **Build failures**: Check file paths match expected structure
- **Simulation errors**: Verify `context.session.variables` usage patterns

### Debug Code Patterns
```javascript
// Liberal use of logInfo for debugging
logInfo('Current segment:', context.session.variables.segmentState.currentSegment);
logInfo('Variables:', JSON.stringify(context.session.variables.varObj, null, 2));
logInfo('Environment:', context.session.variables.VOCALLS_ENV);

// Check simulation mode
if (context.session.variables.SIMULATION_MODE === 'stub') {
  logInfo('Running in stub mode - responses are mocked');
}
```

## Migration and Legacy

- **Existing Projects**: Use `node migrate-engie.js` to migrate from old structure
- **Legacy Compatibility**: `npx voc switch project-name` creates `.active-project` marker for older tools
- **File Structure**: Maintains familiar `globalLibraries/active/` structure

## Quick Reference

| Task | Command |
|------|---------|
| Create project | `npx voc new customer-name` |
| Build for deployment | `npx voc build project-name --prod` |
| Test locally | `npx voc sim project-name --env acc --verbose` |
| Validate ES5.1 | `npx voc build project-name --prod` (will report violations) |
| Clean builds | `npx voc clean` |
| List projects | `npx voc list` |
| Lint code | `npm run lint` |
| Run tests | `npm test` |
