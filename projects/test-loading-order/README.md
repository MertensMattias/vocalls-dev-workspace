# test-loading-order

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
voc build test-loading-order

# Run simulation
voc sim test-loading-order

# Debug interactively  
voc debug test-loading-order

# Clean build artifacts
voc clean test-loading-order
```

## Configuration

Edit `project.json` to configure:
- Customer information
- Environment settings
- Library loading order
- Feature flags
