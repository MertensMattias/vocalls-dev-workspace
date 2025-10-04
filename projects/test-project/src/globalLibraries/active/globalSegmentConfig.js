/**
 * Segment Configuration for test-project
 */

// Define segment transitions
segmentDic.set('INIT', {
    nextSegments: {
        'START': 'WELCOME',
        'ERROR': 'ERROR_HANDLER'
    },
    actions: ['initializeCall']
});

segmentDic.set('WELCOME', {
    nextSegments: {
        'CONTINUE': 'MENU',
        'HELP': 'HELP',
        'END': 'GOODBYE'
    },
    actions: ['playWelcome', 'detectIntent']
});

segmentDic.set('MENU', {
    nextSegments: {
        'OPTION_1': 'OPTION_1_HANDLER',
        'OPTION_2': 'OPTION_2_HANDLER',
        'HELP': 'HELP',
        'END': 'GOODBYE'
    },
    actions: ['playMenu', 'captureInput']
});

segmentDic.set('GOODBYE', {
    nextSegments: {},
    actions: ['playGoodbye', 'endCall']
});

segmentDic.set('ERROR_HANDLER', {
    nextSegments: {
        'RETRY': 'WELCOME',
        'END': 'GOODBYE'
    },
    actions: ['playError', 'logError']
});

logInfo('Segment configuration loaded, segments:', segmentDic.size);