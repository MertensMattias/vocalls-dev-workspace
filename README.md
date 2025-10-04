# Vocalls Development Environment v2

A modern, multi-project development environment for Vocalls call center scripts with simulation, debugging, and export capabilities.

## 🎯 Core Principles

- **Pure JavaScript**: ES2022+ development environment, ES5.1 compatible output
- **Multi-Project Support**: Independent projects with shared development tools
- **Simulation First**: Accurate Vocalls runtime simulation
- **Dependency-Free Export**: Single monolithic files ready for Vocalls deployment

## 🏗️ Architecture

```
vocalls-dev-workspace/
├── core/                    # Development environment (reusable)
│   ├── bin/voc.mjs         # CLI tool
│   ├── src/                # Core functionality
│   │   ├── builder/        # Build system
│   │   ├── simulator/      # ES5.1 runtime simulation
│   │   ├── debugger/       # Interactive debugging
│   │   └── utils/          # Shared utilities
│   ├── templates/          # Project templates
│   └── package.json        # Core package
├── projects/               # Customer projects (isolated)
│   ├── engie-energyline/   # Existing Engie project
│   └── template/           # New project template
├── docs/                   # Documentation
└── package.json           # Workspace root
```

## 🚀 Quick Start

```bash
# Create new workspace
npm install

# Create a new project
npx voc new my-customer-ivr

# Build project
npx voc build my-customer-ivr

# Run simulation
npx voc sim my-customer-ivr

# Debug interactively
npx voc debug my-customer-ivr
```

## 🔧 Features

- **Multi-Project Management**: Each customer/IVR is isolated
- **Build System**: Deterministic dependency ordering and monolithic output
- **ES5.1 Simulation**: Accurate Vocalls runtime environment
- **Interactive Debugging**: Step-through debugging with breakpoints
- **Export Ready**: Single-file deployment to Vocalls platform

## 📝 Project Structure

Each project follows the Vocalls loading order:
1. `globalCode.js` - Core utilities and initialization
2. `globalVariables.js` - Global variable definitions  
3. `globalLibraries/active/` - All active libraries
4. `callScripts/main.js` - Main call script

## 🎪 Development vs Production

- **Development**: Modern JavaScript (ES2022+) with full Node.js features
- **Production**: ES5.1 compatible output for Vocalls deployment
- **Simulation**: Accurate ES5.1 runtime with mocked Vocalls APIs

---

**Pure JavaScript Guarantee**: No TypeScript, no transpilers, no build complexity.