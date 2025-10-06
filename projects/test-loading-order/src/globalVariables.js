/**
 * Global Variables for test-loading-order
 * 
 * Global variable definitions and constants
 * Loaded after globalCode.js
 */

// Environment configuration
var API_BASE_URL = environment === 'prd' ? 'https://api.example.com' : 'https://api-acc.example.com';
var SCHEDULER_ID = null; // Set based on environment

// Line configuration maps
var lineMap = new Map();
var segmentDic = new Map();
var apiConfigMap = new Map();
var intentDefinitions = {};

// Logging configuration
var logVarActive = true;
var logSegmentActive = true; 
var logCdbActive = true;
var useLLMIntentDetection = false;

// Runtime variables
var gsSchedulerId = null;
var routingId = null;
var customerName = '';
var customerProject = '';
var defaultKeysToLog = [];
var addKeysToLog = [];