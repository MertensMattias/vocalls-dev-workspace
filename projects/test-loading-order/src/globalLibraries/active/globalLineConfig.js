/**
 * Line Configuration for test-loading-order
 */

// Sample line configuration
lineMap.set('TEST-LOADING-ORDER_MAIN', {
    routingId: 1001,
    customerName: 'test-loading-order',
    customerProject: 'TEST-LOADING-ORDER',
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