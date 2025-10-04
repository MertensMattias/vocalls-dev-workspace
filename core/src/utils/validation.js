/**
 * ES5.1 Compliance Validation for Vocalls
 * 
 * Checks for forbidden patterns according to Vocalls ES5.1 restrictions
 */

export function validateES51Compliance(code) {
  const forbiddenPatterns = [
    { pattern: /\\basync\\b|\\bawait\\b/, message: 'async/await not allowed in Vocalls ES5.1' },
    { pattern: /\\bclass\\s+[\\w$]+/, message: 'ES6 classes not allowed in Vocalls' },
    { pattern: /\\bimport\\s|export\\s+/, message: 'import/export not allowed in Vocalls' },
    { pattern: /\\brequire\\s*\\(/, message: 'require() not allowed in Vocalls runtime' },
    { pattern: /\\b(let|const)\\s+/, message: 'let/const not allowed, use var in Vocalls ES5.1' },
    { pattern: /\\.catch\\s*\\(/, message: '.catch() not supported in Vocalls (use .then(success, error))' },
    { pattern: /\\?\\?/, message: 'nullish coalescing (??) not allowed in ES5.1' },
    { pattern: /\\?\\./, message: 'optional chaining (?.) not allowed in ES5.1' },
    { pattern: /\\beval\\s*\\(|new\\s+Function\\s*\\(/, message: 'eval/Function constructor not allowed in Vocalls' },
    { pattern: /\\bconsole\\.(log|info|warn|error)\\s*\\(/, message: 'console.* not allowed, use logInfo/logWarn/logError' },
    { pattern: /\\bsetTimeout\\s*\\(|\\bsetInterval\\s*\\(/, message: 'setTimeout/setInterval not available in Vocalls' },
    { pattern: /\\bPromise\\.all\\s*\\(|\\bPromise\\.race\\s*\\(/, message: 'Promise.all/race not supported in Vocalls ES5.1' },
    { pattern: /`[^`]*`/, message: 'Template literals not allowed in ES5.1' },
    { pattern: /=\\s*>/, message: 'Arrow functions not allowed in ES5.1' },
    { pattern: /\\bfor\\s*\\(\\s*(?:let|const)/, message: 'for...of/for...in with let/const not allowed in ES5.1' },
    { pattern: /\\.\\.\\.|\\[\\.\\.\\.]/, message: 'Spread operator not allowed in ES5.1' },
    { pattern: /\\{[^}]*:\\s*[^}]*\\}\\s*=/, message: 'Destructuring assignment not allowed in ES5.1' },
    { pattern: /\\[[^\\]]*\\]\\s*=/, message: 'Array destructuring not allowed in ES5.1' }
  ];

  const violations = [];
  const lines = code.split('\\n');
  
  lines.forEach((line, index) => {
    // Skip comments and strings to reduce false positives
    const cleanLine = line.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '').replace(/\\/\\/.*$/, '');
    
    forbiddenPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(cleanLine)) {
        violations.push({
          line: index + 1,
          message,
          snippet: line.trim()
        });
      }
    });
  });

  return violations;
}

export function validateVocallsGlobals(code) {
  const requiredGlobals = [
    'context',
    'jsonHttpRequest',
    'Storage'
  ];
  
  const availableGlobals = [
    'context.callInfo',
    'context.session.variables',
    'jsonHttpRequest',
    'httpRequest', 
    'Storage',
    'logInfo',
    'logWarn', 
    'logError',
    'log_debug',
    'nowUTC'
  ];
  
  const warnings = [];
  
  // Check for usage of undefined globals (basic check)
  const globalPattern = /\\b([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*[.\\(]/g;
  let match;
  
  while ((match = globalPattern.exec(code)) !== null) {
    const globalName = match[1];
    
    if (!availableGlobals.some(g => g.startsWith(globalName)) && 
        !['var', 'function', 'if', 'for', 'while', 'return', 'new'].includes(globalName)) {
      warnings.push({
        global: globalName,
        message: `Potentially undefined global: ${globalName}`
      });
    }
  }
  
  return warnings;
}