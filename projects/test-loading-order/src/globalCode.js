/**
 * Global Code for test-loading-order
 * 
 * Core utilities and initialization functions
 * Loaded first in the Vocalls runtime
 */

// Vocalls environment detection
var environment = context.session.variables.VOCALLS_ENV || 'acc';
var lineIdentificator = context.settings.lineIdentificator;
var moduleName = context.settings.moduleName;
var language = context.language.substring(0, 2).toUpperCase() || 'NL';

// Core variables
var interactionStartTime;
var callIdKey = null;
var isValidSource = false;

// Context variables
var varObj = {};
var segmentState = {};
var currentSegment = '';
var segmentResult = '';

/**
 * Initialize call flow context
 * Sets up varObj and segmentState in context.session.variables
 */
function initializeCallFlowContext() {
    logInfo('Initializing call flow context');
    
    // Initialize varObj if not exists
    if (!isValidObject(context.session.variables.varObj)) {
        context.session.variables.varObj = {};
    }
    varObj = context.session.variables.varObj;
    
    // Initialize segmentState if not exists  
    if (!isValidObject(context.session.variables.segmentState)) {
        context.session.variables.segmentState = {
            currentSegment: 'INIT',
            segmentResult: '',
            previousSegment: '',
            params: {},
            log: []
        };
    }
    segmentState = context.session.variables.segmentState;
}

/**
 * Utility function to check if object is valid
 */
function isValidObject(obj) {
    return obj && typeof obj === 'object' && obj !== null;
}

/**
 * Get current UTC timestamp
 */
function nowUTC() {
    return new Date().toISOString();
}