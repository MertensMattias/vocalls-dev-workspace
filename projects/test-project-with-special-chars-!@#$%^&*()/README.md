# test-project-with-special-chars-!@#$%^&*()

Vocalls IVR project created on 10/6/2025.

## Structure

```
src/
├── globalCode.js              # Core utilities (loaded first)
├── globalVariables.js         # Global variables
├── globalLibraries/active/    # Global libraries
│   ├── globalApiDic.js       # API configuration
│   ├── globalIntentDefinitions.js  # Intent definitions
│   ├── globalLineConfig.js   # Line configuration
│   └── globalSegmentConfig.js  # Segment configuration
└── callScripts/main.js        # Main call script (loaded last)
```

## Commands

```bash
# Build monolithic output
voc build test-project-with-special-chars-!@#$%^&*()

# Run simulation
voc sim test-project-with-special-chars-!@#$%^&*()

# Debug interactively  
voc debug test-project-with-special-chars-!@#$%^&*()

# Clean build artifacts
voc clean test-project-with-special-chars-!@#$%^&*()
```

## Configuration

Edit `project.json` to configure:
- Customer information
- Environment settings
- Library loading order
- Feature flags
