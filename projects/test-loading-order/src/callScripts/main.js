/**
 * Main Call Script for test-loading-order
 * 
 * Entry point for call handling logic
 * Loaded last in the Vocalls runtime
 */

logInfo('Starting test-loading-order call script');
logInfo('Line Identificator:', lineIdentificator);
logInfo('Environment:', environment);

// Initialize timing
interactionStartTime = nowUTC();
logInfo('Interaction start time:', interactionStartTime);

// Initialize context
initializeCallFlowContext();

// Get line configuration
var lineData = lineMap.get(lineIdentificator);

if (isValidObject(lineData)) {
    logInfo('Line data found for:', lineIdentificator);
    isValidSource = true;
    
    // Extract line configuration
    routingId = lineData.routingId;
    customerName = lineData.customerName;
    customerProject = lineData.customerProject;
    
    // Initialize segment state if needed
    if (!isValidObject(segmentState.currentSegment)) {
        segmentState.currentSegment = 'WELCOME';
        segmentState.segmentResult = '';
    }
    
} else {
    logError('Line data not found for:', lineIdentificator);
    isValidSource = false;
    
    // Set error segment
    segmentState = {
        currentSegment: 'ERROR_INVALID_LINE',
        segmentResult: 'INVALID_LINE',
        params: {},
        log: []
    };
}

// Update context with current state
context.session.variables.varObj = varObj;
context.session.variables.segmentState = segmentState;

logInfo('Call script initialization completed');
logInfo('Current segment:', segmentState.currentSegment);
logInfo('Segment result:', segmentState.segmentResult);