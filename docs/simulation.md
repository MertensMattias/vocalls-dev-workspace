# Simulation Environment

The Vocalls simulation environment provides accurate ES5.1 runtime simulation for local development and testing.

## Overview

The simulator recreates the Vocalls runtime environment with:
- **ES5.1 JavaScript execution context**
- **Mocked Vocalls APIs** (`context`, `jsonHttpRequest`, `Storage`)
- **Session state persistence**
- **HTTP request handling** (stub or real)
- **Storage operations** (memory or disk)

## Runtime Compatibility

### Supported ES5.1 Features

The simulator supports the same JavaScript features as Vocalls:

```javascript
// ✅ Supported
var variables = 'allowed';
function namedFunctions() { return 'supported'; }
var objects = { key: 'value', method: function() {} };
var arrays = [1, 2, 3];
var maps = new Map([['key', 'value']]);
var sets = new Set([1, 2, 3]);
var promises = new Promise(function(resolve, reject) {
  resolve('basic promises supported');
});

// Limited destructuring (ES5.1 compatible)
var data = { name: 'test', value: 42 };
var name = data.name;
var value = data.value;
```

### Forbidden Features

These modern JavaScript features are blocked to match Vocalls restrictions:

```javascript
// ❌ Blocked - ES6+ features
const constants = 'not allowed';
let blockScoped = 'not allowed';
() => 'arrow functions blocked';
`template ${literals} blocked`;
class MyClass {} // classes blocked

// ❌ Blocked - Advanced Promise features  
promise.catch(handler); // use .then(success, error)
Promise.all([p1, p2]); // not supported
Promise.race([p1, p2]); // not supported

// ❌ Blocked - Modern syntax
const { destructured } = object; // destructuring blocked
const [first, second] = array; // destructuring blocked
function(...args) {} // spread blocked
{ ...spread } // spread blocked

// ❌ Blocked - Node.js features
require('module'); // require blocked
console.log('message'); // use logInfo instead
setTimeout(fn, 1000); // not available
setInterval(fn, 1000); // not available
```

## Vocalls API Simulation

### Context Object

```javascript
// Available in simulation
context = {
  settings: {
    moduleName: 'sim-acc',
    lineIdentificator: 'SIM_TEST_LINE'
  },
  language: 'nl-NL',
  callInfo: {
    callId: 'CALL_1234567890',
    startTime: '2025-01-04T12:00:00.000Z',
    direction: 'inbound'
  },
  session: {
    variables: {
      VOCALLS_ENV: 'acc',
      SIMULATION_MODE: 'stub',
      // Your custom variables here
      varObj: {},
      segmentState: {}
    }
  }
};
```

### Logging Functions

```javascript
// Available logging functions (same as Vocalls)
logInfo('Information message', data);
logWarn('Warning message', data);
logError('Error message', data);
log_debug('Debug message', data); // Vocalls built-in

// ❌ console functions are blocked
// console.log('blocked'); // Use logInfo instead
```

### HTTP Requests

The simulator provides two modes for HTTP requests:

#### Stub Mode (Default)
```javascript
// Returns mocked responses
jsonHttpRequest({
  url: 'https://api.example.com/customer',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 123 })
}).then(function(response) {
  // response = {
  //   success: true,
  //   status: 200,
  //   data: { message: 'Stubbed response', timestamp: '...' },
  //   headers: { 'content-type': 'application/json' }
  // }
});
```

#### Real Mode
```javascript
// Makes actual HTTP requests (future feature)
// Currently returns error in demo implementation
```

### Storage Operations

#### Memory Storage (Default)
```javascript
// Stored in memory, lost between runs
var writeResult = Storage.writeFile('logs/call.json', JSON.stringify(data));
// writeResult = { success: true, error: null }

var readResult = Storage.readFile('logs/call.json');
// readResult = { success: true, text: '{"data":"..."}', error: null }
```

#### Disk Storage
```javascript
// Persistent storage on disk (future feature)
// Currently returns error in demo implementation
```

## Environment Configuration

### Environment Variables

Set different environments via CLI:
```bash
voc sim my-project --env acc    # Acceptance
voc sim my-project --env prd    # Production  
voc sim my-project --env dvp    # Development
```

Accessed in code:
```javascript
var environment = context.session.variables.VOCALLS_ENV; // 'acc', 'prd', 'dvp'
```

### HTTP Modes

Control HTTP behavior:
```bash
voc sim my-project --mode stub  # Mocked responses
voc sim my-project --mode real  # Real HTTP requests
```

### Storage Modes

Control storage behavior:
```bash
voc sim my-project --storage memory  # In-memory (default)
voc sim my-project --storage disk    # Persistent disk
```

## Limitations

### Known Differences from Vocalls

1. **Timing**: Simulation runs faster than real Vocalls calls
2. **Network**: Stub mode returns instant responses
3. **Storage**: Memory mode is reset between runs
4. **Session**: Single execution, no multi-call session handling
5. **Resources**: No resource limits (memory, CPU time)

### Performance Considerations

- **Timeout**: Scripts timeout after 5 seconds
- **Memory**: No memory limits enforced
- **Files**: File loading is synchronous
- **Logs**: All logging goes to console

## Development Workflow

### Local Development

```bash
# Quick test with defaults
voc sim my-project

# Production-like environment
voc sim my-project --env prd --mode real

# Development with verbose logging
voc sim my-project --env dvp --verbose
```

### Testing Different Scenarios

```javascript
// Test environment-specific behavior
if (environment === 'acc') {
  // Acceptance testing logic
  apiUrl = 'https://api-acc.example.com';
} else if (environment === 'prd') {
  // Production logic
  apiUrl = 'https://api.example.com';
}

// Test line configurations
var testLines = ['CUSTOMER_MAIN', 'CUSTOMER_SUPPORT', 'CUSTOMER_SALES'];
testLines.forEach(function(lineId) {
  context.settings.lineIdentificator = lineId;
  // Test line-specific behavior
});
```

### Debugging Support

```javascript
// Use logInfo for debugging output
logInfo('Current segment:', segmentState.currentSegment);
logInfo('Variables:', JSON.stringify(varObj, null, 2));
logInfo('API response:', response);

// Check simulation mode
if (context.session.variables.SIMULATION_MODE === 'stub') {
  logInfo('Running in stub mode - responses are mocked');
}
```

## Best Practices

### Code Organization

```javascript
// Global initialization
function initializeCallFlowContext() {
  logInfo('Initializing call context');
  if (!context.session.variables.varObj) {
    context.session.variables.varObj = {};
  }
  if (!context.session.variables.segmentState) {
    context.session.variables.segmentState = {
      currentSegment: 'INIT',
      segmentResult: '',
      log: []
    };
  }
}

// Environment-specific configuration
function getApiConfig() {
  var baseUrls = {
    acc: 'https://api-acc.example.com',
    prd: 'https://api.example.com',
    dvp: 'https://dev-api.example.com'
  };
  return baseUrls[environment] || baseUrls.acc;
}
```

### Error Handling

```javascript
// Robust error handling for simulation
function safeApiCall(config) {
  return jsonHttpRequest(config).then(function(response) {
    if (!response.success) {
      logError('API call failed:', response.error);
      return { success: false, error: response.error };
    }
    return response;
  }).then(null, function(error) {
    // Handle promise rejection (but don't use .catch!)
    logError('Request error:', error.message);
    return { success: false, error: error.message };
  });
}
```

### Testing Strategies

```javascript
// Test multiple scenarios
function testSegmentTransitions() {
  var testCases = [
    { input: 'WELCOME', expected: 'MENU' },
    { input: 'MENU', expected: 'OPTION_1' },
    { input: 'ERROR', expected: 'WELCOME' }
  ];
  
  testCases.forEach(function(testCase) {
    segmentState.currentSegment = testCase.input;
    var result = processSegmentTransition(segmentState);
    logInfo('Test:', testCase.input, '=>', result.currentSegment, 
            '(expected:', testCase.expected + ')');
  });
}
```

## Troubleshooting

### Common Issues

**Script Timeout:**
```
Error: Script execution timeout (5000ms)
```
- Reduce complexity or split into smaller operations
- Check for infinite loops
- Avoid blocking operations

**Reference Errors:**
```
ReferenceError: someVariable is not defined
```
- Ensure variables are declared with `var`
- Check spelling and scope
- Initialize variables before use

**Promise Errors:**
```
Error: .catch() not supported in Vocalls ES5.1
```
- Use `.then(successCallback, errorCallback)` instead
- Handle errors in the second parameter of `.then()`

### Debugging Tips

1. **Use verbose mode**: `voc sim project --verbose`
2. **Add logging**: Liberally use `logInfo()` for debugging
3. **Test incrementally**: Test small changes frequently
4. **Check session state**: Log `context.session.variables` to inspect state
5. **Validate syntax**: Run `voc build project --prod` to check ES5.1 compliance