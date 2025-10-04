#!/usr/bin/env node

/**
 * Migration Script for Engie Energyline Project
 * 
 * Migrates the existing project from the old workspace to the new structure
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OLD_WORKSPACE = 'C:\\Users\\merte\\Development\\vocalls-env-warp';
const NEW_WORKSPACE = __dirname;

async function migrateEngieProject() {
  console.log('🔄 Migrating Engie Energyline project...');
  
  const projectName = 'engie-energyline';
  const newProjectPath = join(NEW_WORKSPACE, 'projects', projectName);
  
  // Create project structure
  await createProjectStructure(newProjectPath);
  
  // Migrate files
  await migrateProjectFiles(projectName, newProjectPath);
  
  // Create project configuration
  await createProjectConfig(newProjectPath);
  
  console.log('✅ Migration completed!');
  console.log(`   Project location: ${newProjectPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  npm install                        # Install dependencies');  
  console.log(`  voc build ${projectName}          # Build project`);
  console.log(`  voc sim ${projectName}            # Test simulation`);
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
    console.log(`  📁 Created ${dir || 'project root'}`);
  }
}

async function migrateProjectFiles(projectName, newProjectPath) {
  const migrations = [
    // Global code initialization
    {
      from: join(OLD_WORKSPACE, 'callScript_init', 'globalCode.js'),
      to: join(newProjectPath, 'src', 'globalCode.js'),
      required: false
    },
    {
      from: join(OLD_WORKSPACE, 'callScript_init', 'globalVariables.js'), 
      to: join(newProjectPath, 'src', 'globalVariables.js'),
      required: false
    },
    
    // Global libraries from the active project
    {
      from: join(OLD_WORKSPACE, 'projects', projectName, 'globalLibraries', 'globalApiDic.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalApiDic.js')
    },
    {
      from: join(OLD_WORKSPACE, 'projects', projectName, 'globalLibraries', 'globalCode.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalCode.js')
    },
    {
      from: join(OLD_WORKSPACE, 'projects', projectName, 'globalLibraries', 'globalIntentDefinitions.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalIntentDefinitions.js')
    },
    {
      from: join(OLD_WORKSPACE, 'projects', projectName, 'globalLibraries', 'globalLineConfig.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalLineConfig.js')
    },
    {
      from: join(OLD_WORKSPACE, 'projects', projectName, 'globalLibraries', 'globalSegmentConfig.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalSegmentConfig.js')
    },
    
    // Main call script
    {
      from: join(OLD_WORKSPACE, 'projects', projectName, 'callScripts', 'main.js'),
      to: join(newProjectPath, 'src', 'callScripts', 'main.js')
    },
    
    // Fallback to root level if project-specific doesn't exist
    {
      from: join(OLD_WORKSPACE, 'globalLibraries', 'active', 'globalApiDic.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalApiDic.js'),
      fallback: true
    },
    {
      from: join(OLD_WORKSPACE, 'globalLibraries', 'active', 'globalCode.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalCode.js'),
      fallback: true
    },
    {
      from: join(OLD_WORKSPACE, 'globalLibraries', 'active', 'globalIntentDefinitions.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalIntentDefinitions.js'),
      fallback: true
    },
    {
      from: join(OLD_WORKSPACE, 'globalLibraries', 'active', 'globalLineConfig.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalLineConfig.js'),
      fallback: true
    },
    {
      from: join(OLD_WORKSPACE, 'globalLibraries', 'active', 'globalSegmentConfig.js'),
      to: join(newProjectPath, 'src', 'globalLibraries', 'active', 'globalSegmentConfig.js'),
      fallback: true
    },
    
    // Main script fallback
    {
      from: join(OLD_WORKSPACE, 'callScripts', 'main.js'),
      to: join(newProjectPath, 'src', 'callScripts', 'main.js'),
      fallback: true
    }
  ];
  
  for (const migration of migrations) {
    try {
      await fs.access(migration.from);
      
      // Check if destination already exists (from primary migration)
      if (migration.fallback) {
        try {
          await fs.access(migration.to);
          console.log(`  ⏭️  Skipping ${migration.from} (already exists)`);
          continue;
        } catch {
          // Destination doesn't exist, proceed with fallback
        }
      }
      
      const content = await fs.readFile(migration.from, 'utf8');
      await fs.writeFile(migration.to, content, 'utf8');
      console.log(`  📝 Migrated ${migration.from.split('\\\\').pop()}`);
      
    } catch (err) {
      if (migration.required !== false) {
        console.log(`  ⚠️  Could not migrate ${migration.from}: ${err.message}`);
      }
    }
  }
}

async function createProjectConfig(projectPath) {
  const config = {
    name: 'engie-energyline',
    customer: 'ENGIE',
    description: 'Energyline IVR system for ENGIE customer service',
    version: '1.0.0',
    migrated: new Date().toISOString(),
    libraryOrder: [
      'globalCode.js',
      'globalApiDic.js',
      'globalIntentDefinitions.js',
      'globalLineConfig.js',
      'globalSegmentConfig.js'
    ],
    environments: {
      acc: {
        apiBase: 'https://api.n-allo.be',
        schedulerId: 4090
      },
      prd: {
        apiBase: 'https://api.n-allo.be',
        schedulerId: 4090
      },
      dvp: {
        apiBase: 'https://api.n-allo.be',
        schedulerId: 4090
      }
    },
    features: {
      intentDetection: true,
      cdbLogging: true,
      segmentLogging: true,
      llmIntentDetection: false
    }
  };
  
  const configPath = join(projectPath, 'project.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  console.log('  📝 Created project.json');
  
  // Create README
  const readme = `# Engie Energyline IVR

Migrated from legacy Vocalls environment on ${new Date().toLocaleDateString()}.

## Original Structure

This project was migrated from the legacy multi-IVR workspace structure to the new isolated project structure.

## Usage

\`\`\`bash
# Build the project
voc build engie-energyline

# Run simulation
voc sim engie-energyline --env acc

# Debug (when available)
voc debug engie-energyline
\`\`\`

## Migration Notes

- All global libraries have been moved to \`src/globalLibraries/active/\`
- Main script is now in \`src/callScripts/main.js\`
- Project configuration is in \`project.json\`
- Build output will be in \`dist/\`

## Environment Configuration

- **acc**: Acceptance environment with API base and scheduler ID
- **prd**: Production environment  
- **dvp**: Development environment
`;

  await fs.writeFile(join(projectPath, 'README.md'), readme, 'utf8');
  console.log('  📝 Created README.md');
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateEngieProject().catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  });
}