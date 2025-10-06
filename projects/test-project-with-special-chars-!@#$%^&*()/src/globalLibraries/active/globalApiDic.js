/**
 * API Dictionary for test-project-with-special-chars-!@#$%^&*()
 * 
 * API endpoint and configuration definitions
 */

// API configuration map
apiConfigMap.set('customerLookup', {
    endpoint: API_BASE_URL + '/customer/lookup',
    method: 'POST',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

apiConfigMap.set('scheduleCallback', {
    endpoint: API_BASE_URL + '/callback/schedule', 
    method: 'POST',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

logInfo('API configuration loaded, endpoints:', apiConfigMap.size);