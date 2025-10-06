/**
 * Intent Definitions for test-loading-order
 */

intentDefinitions = {
    greeting: {
        patterns: ['hello', 'hi', 'good morning', 'good afternoon'],
        confidence: 0.8
    },
    help: {
        patterns: ['help', 'support', 'assistance'],
        confidence: 0.9
    },
    goodbye: {
        patterns: ['bye', 'goodbye', 'thank you', 'thanks'],
        confidence: 0.7
    }
};

logInfo('Intent definitions loaded:', Object.keys(intentDefinitions).length);