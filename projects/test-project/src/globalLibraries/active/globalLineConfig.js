/**
 * Line Configuration for test-project
 */

// Sample line configuration
lineMap.set('TEST-PROJECT_MAIN', {
    routingId: 1001,
    customerName: 'test-project',
    customerProject: 'TEST-PROJECT',
    environment: environment,
    operations: [{
        params: {
            schedulerId: SCHEDULER_ID,
            useLLMIntentDetection: false,
            logVarActive: true,
            logSegmentActive: true,
            logCdbActive: true
        }
    }]
});

logInfo('Line configuration loaded, lines:', lineMap.size);