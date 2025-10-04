# CLI Reference

The `voc` command-line interface provides all development operations for Vocalls projects.

## Installation

```bash
# From workspace root
npm install

# The CLI is available as:
npx voc --help
```

## Global Options

- `--verbose` - Enable verbose logging
- `--quiet` - Suppress non-essential output
- `--help` - Show help information
- `--version` - Show version information

## Commands

### `voc new <name>`

Create a new Vocalls project from template.

```bash
voc new my-customer-ivr
voc new hello-world --template basic
```

**Arguments:**
- `<name>` - Project name (required)

**Options:**
- `-t, --template <template>` - Template to use (default: 'default')

**Creates:**
- `projects/<name>/` directory structure
- Template files with examples
- `project.json` configuration
- `README.md` documentation

### `voc build <project>`

Build project to monolithic Vocalls-compatible output.

```bash
voc build my-customer
voc build my-customer --prod
voc build my-customer --prod --clean
```

**Arguments:**
- `<project>` - Project name (required)

**Options:**
- `--prod` - Production build (optimized + ES5.1 validation)
- `--clean` - Clean build directory before building

**Output:**
- `projects/<project>/dist/<project>.monolith.js`
- Build statistics and validation results

### `voc sim <project>`

Run project in Vocalls simulation environment.

```bash
voc sim my-customer
voc sim my-customer --env prd --mode real
voc sim my-customer --storage disk --verbose
```

**Arguments:**
- `<project>` - Project name (required)

**Options:**
- `--script <script>` - Specific script to run (default: 'main')
- `--env <env>` - Environment: acc|prd|dvp (default: 'acc')
- `--mode <mode>` - HTTP mode: real|stub (default: 'stub')
- `--storage <storage>` - Storage mode: disk|memory (default: 'memory')

**Features:**
- ES5.1-compliant sandbox execution
- Mocked Vocalls APIs
- Session state management
- HTTP request logging
- Performance metrics

### `voc debug <project>`

Run project with interactive debugging (future).

```bash
voc debug my-customer
voc debug my-customer --breakpoints debug.json
```

**Arguments:**
- `<project>` - Project name (required)

**Options:**
- `--script <script>` - Specific script to run (default: 'main')
- `--env <env>` - Environment: acc|prd|dvp (default: 'acc')
- `--breakpoints <file>` - Breakpoints configuration file

**Note:** Currently falls back to verbose simulation mode.

### `voc list`

List all projects in the workspace.

```bash
voc list
voc list --active
```

**Options:**
- `--active` - Show only the active project

**Output:**
- Project names and metadata
- Customer information
- Version numbers
- Active project indicator

### `voc switch <project>`

Switch active project for legacy compatibility.

```bash
voc switch my-customer
```

**Arguments:**
- `<project>` - Project name (required)

**Creates:**
- `.active-project` marker file
- Legacy compatibility state

### `voc clean [project]`

Clean build artifacts.

```bash
voc clean                    # Clean all projects
voc clean my-customer        # Clean specific project
```

**Arguments:**
- `[project]` - Project name (optional, cleans all if omitted)

**Removes:**
- `dist/` directories
- Build artifacts
- Temporary files

## Usage Examples

### Complete Development Workflow

```bash
# 1. Create new project
voc new acme-support

# 2. Edit files in projects/acme-support/src/

# 3. Test with simulation
voc sim acme-support --env acc

# 4. Build for production
voc build acme-support --prod

# 5. Deploy dist/acme-support.monolith.js to Vocalls
```

### Multi-Project Development

```bash
# Work with multiple projects
voc list                     # See all projects
voc sim project-a --env acc  # Test project A
voc sim project-b --env prd  # Test project B
voc build project-a --prod   # Build project A
voc build project-b --prod   # Build project B
```

### Legacy Compatibility

```bash
# Switch active project (for tools expecting single project)
voc switch my-customer

# Build and test active project
voc build my-customer
voc sim my-customer
```

## Configuration Files

### Workspace Configuration

The workspace root `package.json` defines:
- npm workspaces
- Global scripts
- Development dependencies

### Project Configuration

Each project's `project.json` defines:
- Customer information
- Environment settings
- Library loading order
- Feature flags

Example:
```json
{
  "name": "my-customer",
  "customer": "ACME Corp",
  "libraryOrder": [
    "globalApiDic.js",
    "globalLineConfig.js",
    "globalSegmentConfig.js"
  ],
  "environments": {
    "acc": { "apiBase": "https://api-acc.example.com" },
    "prd": { "apiBase": "https://api.example.com" }
  }
}
```

## Error Handling

### Common Errors

**Project Not Found:**
```
❌ Project not found: my-customer
```
- Check project name spelling
- Use `voc list` to see available projects

**ES5.1 Compliance Violations:**
```
❌ ES5.1 compliance violations found:
   Line 15: let/const not allowed, use var in Vocalls ES5.1
   Code: let result = processData();
```
- Fix syntax violations
- Use `--verbose` for detailed information

**Build Failures:**
```
❌ Build failed: Main script not found: src/callScripts/main.js
```
- Ensure required files exist
- Check file paths and structure

### Debug Output

Use `--verbose` for detailed logging:
```bash
voc build my-customer --verbose
voc sim my-customer --verbose
```

## Integration

### NPM Scripts

Add convenient npm scripts to workspace root:
```json
{
  "scripts": {
    "new": "voc new",
    "build": "voc build",
    "sim": "voc sim",
    "clean": "voc clean",
    "list": "voc list"
  }
}
```

Usage:
```bash
npm run new my-project
npm run build my-project
npm run sim my-project
```

### CI/CD Integration

```bash
# Build all projects
for project in $(voc list --names); do
  voc build "$project" --prod
done

# Or use future --all flag
voc build --all --prod
```