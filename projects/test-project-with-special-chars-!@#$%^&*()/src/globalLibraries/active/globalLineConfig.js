/**
 * Line Configuration for test-project-with-special-chars-!@#$%^&*()
 */

// Sample line configuration
lineMap.set('TEST-PROJECT-WITH-SPECIAL-CHARS-!@#$%^&*()_MAIN', {
    routingId: 1001,
    customerName: 'test-project-with-special-chars-!@#$%^&*()',
    customerProject: 'TEST-PROJECT-WITH-SPECIAL-CHARS-!@#$%^&*()',
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