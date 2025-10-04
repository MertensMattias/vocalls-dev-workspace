/**
 * Vocalls ES5.1 Simulation Engine
 * 
 * Provides accurate simulation of the Vocalls runtime environment:
 * - ES5.1 JavaScript execution context
 * - Mocked Vocalls global objects and APIs
 * - Session persistence and state management
 * - HTTP request mocking/proxying
 * - Storage operations
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import vm from 'vm';

export class VocallsSimulator {
  constructor(options = {}) {
    this.projectPath = options.projectPath;
    this.httpMode = options.httpMode || 'stub';
    this.storageMode = options.storageMode || 'memory';
    this.environment = options.environment || 'acc';
    this.verbose = options.verbose || false;
    
    this.stats = {
      filesLoaded: 0,
      httpRequests: 0,
      storageOps: 0,
      startTime: null,
      endTime: null
    };
    
    this.memoryStorage = new Map();
    this.httpRequests = [];
  }
  
  async execute(scriptName = 'main') {
    this.stats.startTime = Date.now();
    
    // Create Vocalls-compatible sandbox
    const sandbox = this.createSandbox();
    
    // Load project files in Vocalls order
    await this.loadProjectFiles(sandbox);
    
    this.stats.endTime = Date.now();
    
    return {
      executionTime: this.stats.endTime - this.stats.startTime,
      filesLoaded: this.stats.filesLoaded,
      httpRequests: this.stats.httpRequests,
      storageOps: this.stats.storageOps,
      sessionState: sandbox.context.session,
      httpLog: this.httpRequests
    };
  }
  
  createSandbox() {
    const context = this.createVocallsContext();
    
    const sandbox = {
      // Vocalls global context
      context,
      
      // Vocalls built-in functions
      logInfo: (...args) => this.log('INFO', ...args),
      logWarn: (...args) => this.log('WARN', ...args),
      logError: (...args) => this.log('ERROR', ...args),
      log_debug: (...args) => this.log('DEBUG', ...args),
      
      // Vocalls HTTP API
      jsonHttpRequest: (config) => this.handleHttpRequest(config),
      httpRequest: (config) => this.handleHttpRequest(config),
      
      // Vocalls Storage API  
      Storage: {
        readFile: (path) => this.handleStorageRead(path),
        writeFile: (path, content) => this.handleStorageWrite(path, content)
      },
      
      // Vocalls utility functions
      nowUTC: () => new Date().toISOString(),
      
      // ES5.1 globals (limited set)
      Date,
      Math,
      JSON,
      String,
      Number,
      Boolean,
      Array,
      Object,
      RegExp,
      Error,
      TypeError,
      ReferenceError,
      SyntaxError,
      
      // Map and Set (allowed in Vocalls ES5.1)
      Map,
      Set,
      WeakMap,
      WeakSet,
      
      // Promise (limited support in Vocalls)
      Promise: this.createLimitedPromise(),
      
      // Global variables that will be populated by scripts
      var: undefined, // Placeholder to prevent ReferenceError
      function: undefined,
      
      // Hide Node.js globals
      global: undefined,
      process: undefined,
      require: undefined,
      module: undefined,
      exports: undefined,
      __dirname: undefined,
      __filename: undefined,
      console: undefined, // Force use of Vocalls logging
      setTimeout: undefined, // Not available in Vocalls
      setInterval: undefined,
      clearTimeout: undefined,
      clearInterval: undefined
    };
    
    return sandbox;
  }
  
  createVocallsContext() {
    return {
      settings: {
        moduleName: `sim-${this.environment}`,
        lineIdentificator: 'SIM_TEST_LINE'
      },
      language: 'nl-NL',
      callInfo: {
        callId: `CALL_${Date.now()}`,
        startTime: new Date().toISOString(),
        direction: 'inbound'
      },
      session: {
        variables: {
          VOCALLS_ENV: this.environment,
          SIMULATION_MODE: this.httpMode
        }
      }
    };
  }
  
  createLimitedPromise() {
    // Vocalls ES5.1 supports basic Promise but not .catch()
    class VocallsPromise extends Promise {
      catch() {
        throw new Error('.catch() not supported in Vocalls ES5.1. Use .then(success, error)');
      }
      
      static all() {
        throw new Error('Promise.all() not supported in Vocalls ES5.1');
      }
      
      static race() {
        throw new Error('Promise.race() not supported in Vocalls ES5.1');
      }
    }
    
    return VocallsPromise;
  }
  
  async loadProjectFiles(sandbox) {
    // Vocalls loading order:
    // 1. globalCode.js
    // 2. globalVariables.js
    // 3. globalLibraries/active/* (in dependency order)
    // 4. callScripts/main.js
    
    const loadOrder = [
      'src/globalCode.js',
      'src/globalVariables.js'
    ];
    
    // Add global libraries
    const libsDir = join(this.projectPath, 'src', 'globalLibraries', 'active');
    if (await this.fileExists(libsDir)) {
      const config = await this.loadProjectConfig();
      const libraryOrder = config.libraryOrder || await this.getLibraryFiles(libsDir);
      
      for (const lib of libraryOrder) {
        loadOrder.push(`src/globalLibraries/active/${lib}`);
      }
    }
    
    // Add main script
    loadOrder.push('src/callScripts/main.js');
    
    // Execute each file in order
    for (const file of loadOrder) {
      await this.loadScript(sandbox, file);
    }
  }
  
  async loadScript(sandbox, relativePath) {
    const fullPath = join(this.projectPath, relativePath);
    
    if (!await this.fileExists(fullPath)) {
      if (this.verbose) {
        this.log('WARN', `File not found: ${relativePath}`);
      }
      return;
    }
    
    try {
      const code = await fs.readFile(fullPath, 'utf8');
      const script = new vm.Script(code, {
        filename: relativePath,
        lineOffset: 0,
        columnOffset: 0
      });
      
      script.runInNewContext(sandbox, {
        timeout: 5000, // 5 second timeout
        displayErrors: true
      });
      
      this.stats.filesLoaded++;
      
      if (this.verbose) {
        this.log('DEBUG', `Loaded: ${relativePath}`);
      }
      
    } catch (err) {
      throw new Error(`Error in ${relativePath}: ${err.message}`);
    }
  }
  
  async handleHttpRequest(config) {
    this.stats.httpRequests++;
    
    if (this.verbose) {
      this.log('DEBUG', `HTTP ${config.method || 'GET'}: ${config.url}`);
    }
    
    // Log request
    const request = {
      timestamp: new Date().toISOString(),
      method: config.method || 'GET',
      url: config.url,
      headers: config.headers,
      body: config.body
    };
    
    this.httpRequests.push(request);
    
    if (this.httpMode === 'stub') {
      // Return stubbed response
      return this.createStubResponse(config);
    } else {
      // Make real HTTP request (would need fetch polyfill)
      throw new Error('Real HTTP mode not implemented in this demo');
    }
  }
  
  createStubResponse(config) {
    return Promise.resolve({
      success: true,
      status: 200,
      data: {
        message: `Stubbed response for ${config.url}`,
        timestamp: new Date().toISOString(),
        method: config.method || 'GET'
      },
      headers: {
        'content-type': 'application/json'
      }
    });
  }
  
  handleStorageRead(filePath) {
    this.stats.storageOps++;
    
    try {
      if (this.storageMode === 'memory') {
        const content = this.memoryStorage.get(filePath);
        return {
          success: content !== undefined,
          text: content || null,
          error: content === undefined ? 'file_not_found' : null
        };
      } else {
        // Disk storage would be implemented here
        return {
          success: false,
          text: null,
          error: 'disk_storage_not_implemented'
        };
      }
    } catch (err) {
      return {
        success: false,
        text: null,
        error: err.message
      };
    }
  }
  
  handleStorageWrite(filePath, content) {
    this.stats.storageOps++;
    
    try {
      if (this.storageMode === 'memory') {
        this.memoryStorage.set(filePath, String(content || ''));
        return {
          success: true,
          error: null
        };
      } else {
        // Disk storage would be implemented here
        return {
          success: false,
          error: 'disk_storage_not_implemented'
        };
      }
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }
  
  log(level, ...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    console.log(`[${timestamp}] [${level}] ${message}`);
  }
  
  async loadProjectConfig() {
    const configPath = join(this.projectPath, 'project.json');
    
    try {
      const content = await fs.readFile(configPath, 'utf8');
      return JSON.parse(content);
    } catch {
      return { libraryOrder: [] };
    }
  }
  
  async getLibraryFiles(libsDir) {
    try {
      const files = await fs.readdir(libsDir);
      return files
        .filter(file => file.endsWith('.js'))
        .sort(); // Alphabetical fallback
    } catch {
      return [];
    }
  }
  
  async fileExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}