# Setup Guide - Vocalls Development Environment v2

## 🚀 Quick Setup

### 1. Install Dependencies

```powershell
# From the workspace root
npm install
```

### 2. Create GitHub Repository

1. **Go to GitHub.com** and create a new repository:
   - Repository name: `vocalls-dev-environment`  
   - Description: `Modern multi-project development environment for Vocalls call center scripts`
   - Make it **Public** (or Private if preferred)
   - **Don't** initialize with README, .gitignore, or license (we already have these)

2. **Copy the repository URL** (e.g., `https://github.com/yourusername/vocalls-dev-environment.git`)

### 3. Connect Local Repository to GitHub

```powershell
# Add GitHub as remote origin (replace with your URL)
git remote add origin https://github.com/yourusername/vocalls-dev-environment.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔧 Verify Installation

### Test CLI Tool

```powershell
# Check CLI is working
npx voc --version

# Create a test project
npx voc new hello-world

# Build the project
npx voc build hello-world

# Run simulation
npx voc sim hello-world --verbose
```

### Expected Output Structure

After running the commands above, you should see:

```
vocalls-dev-workspace/
├── projects/
│   └── hello-world/           # ← Created by 'voc new'
│       ├── src/
│       │   ├── globalCode.js
│       │   ├── globalVariables.js
│       │   ├── globalLibraries/active/
│       │   └── callScripts/main.js
│       ├── dist/
│       │   └── hello-world.monolith.js  # ← Created by 'voc build'
│       └── project.json
└── ...
```

## 📦 Migrate Existing Engie Project

```powershell
# Run the migration script
node migrate-engie.js

# This will create:
# projects/engie-energyline/ with all your existing files
```

## 🎯 Development Workflow

```powershell
# 1. List existing projects
npx voc list

# 2. Create new project
npx voc new my-customer

# 3. Edit files in projects/my-customer/src/

# 4. Test with simulation  
npx voc sim my-customer --env acc

# 5. Build for production
npx voc build my-customer --prod

# 6. Deploy dist/my-customer.monolith.js to Vocalls
```

## 📋 Project Structure

Each project follows Vocalls loading order:

1. **src/globalCode.js** - Core utilities (loaded first)
2. **src/globalVariables.js** - Global variable definitions
3. **src/globalLibraries/active/*.js** - Libraries in dependency order
4. **src/callScripts/main.js** - Main call script (loaded last)

## ⚙️ Configuration

### Workspace Level (`package.json`)
- npm workspaces configuration
- Global development dependencies
- Shared scripts and tools

### Project Level (`project.json`)
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
    "acc": { "apiBase": "https://api-acc.example.com" },
    "prd": { "apiBase": "https://api.example.com" }
  }
}
```

## 🛠️ Available Commands

### Project Management
- `voc new <name>` - Create new project
- `voc list` - List all projects  
- `voc switch <project>` - Switch active project (legacy)

### Development
- `voc build <project>` - Build monolithic output
- `voc sim <project>` - Run ES5.1 simulation
- `voc debug <project>` - Interactive debugging (future)
- `voc clean [project]` - Clean build artifacts

### Maintenance  
- `npm run lint` - Lint all code
- `npm run format` - Format all code
- `npm test` - Run tests (when implemented)

## 🎪 Key Benefits

### For Development
- **Modern tooling** with pure JavaScript (no TypeScript complexity)
- **Multi-project support** without conflicts between customers
- **Fast development cycles** with accurate simulation
- **ES5.1 validation** prevents deployment issues

### For Production
- **Single-file deployment** ready for Vocalls
- **Deterministic builds** with proper dependency ordering  
- **100% Vocalls compatibility** guaranteed
- **Structured output** with clear section organization

### For Maintenance
- **Clear project separation** reduces conflicts
- **Standardized structure** across all projects
- **Version control friendly** organization
- **Documentation-driven** development

## 🚨 Important Notes

### ES5.1 Compliance
Your output code must be ES5.1 compatible for Vocalls:

```javascript
// ✅ Good - ES5.1 compatible
var result = processData();
function handleResponse() { return 'success'; }
promise.then(success, error); // No .catch()
logInfo('message'); // Not console.log()

// ❌ Bad - Not compatible
const result = processData(); // Use var
let data = getData(); // Use var  
() => 'arrow function'; // Use function()
`template ${string}`; // Use string concatenation
promise.catch(error); // Use .then(success, error)
console.log('msg'); // Use logInfo()
```

### Project Isolation
- Each project is completely independent
- No shared dependencies between projects
- Separate build outputs and configurations
- Clean separation of customer-specific code

## 🔍 Troubleshooting

### Common Issues

**Command not found:**
```
'voc' is not recognized...
```
Solution: Use `npx voc` instead of `voc`

**Project not found:**
```
❌ Project not found: my-project
```
Solution: Check spelling with `npx voc list`

**Build failures:**
```
❌ ES5.1 compliance violations found
```
Solution: Fix syntax violations, use `--verbose` for details

### Getting Help

- **Documentation**: Check `docs/` folder
- **CLI Help**: Run `npx voc --help`  
- **Examples**: Look at generated project templates
- **Issues**: Report via GitHub Issues (after syncing)

## 📚 Further Reading

- [Architecture Overview](docs/architecture.md) - Design principles and components
- [CLI Reference](docs/cli.md) - Complete command documentation  
- [Simulation Guide](docs/simulation.md) - Runtime environment details
- [Getting Started](docs/getting-started.md) - Step-by-step tutorial