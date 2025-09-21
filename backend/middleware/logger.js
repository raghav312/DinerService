const { getContainer } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const { triggerRca } = require('./aiRca');

async function logAction(action, table, data = null, result = null, error = null, success = true, userAgent = 'Unknown') {
  try {
    const logsContainer = getContainer('logs');
    
    const logEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      table,
      data: data ? JSON.stringify(data) : null,
      result: result ? JSON.stringify(result) : null,
      error: error ? error.toString() : null,
      success,
      userAgent
    };

    await logsContainer.items.create(logEntry);
    console.log(`Logged action: ${action} on ${table} - ${success ? 'SUCCESS' : 'ERROR'}`);

    // Trigger RCA only for error logs
    if (!success || error) {
      // Pass the logEntry (with parsed data/result) to RCA
      const rcaResponse = await triggerRca({
        ...logEntry,
        data: data,
        result: result
      });
      // Log the RCA response (as a separate log entry)
      await logsContainer.items.create({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: 'AI_RCA',
        table,
        data: data ? JSON.stringify(data) : null,
        result: rcaResponse || null,
        error: rcaResponse && rcaResponse.rcaError ? rcaResponse.rcaError : null,
        success: rcaResponse && !rcaResponse.rcaError,
        userAgent
      });
    }
  } catch (logError) {
    console.error('Failed to log action:', logError);
    // Don't throw error to prevent breaking the main operation
  }
}

function createLoggerMiddleware(action, table) {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      logAction(
        action, 
        table, 
        req.body, 
        success ? data : null, 
        success ? null : data, 
        success,
        req.get('User-Agent')
      );
      originalSend.call(this, data);
    };
    
    res.json = function(data) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      logAction(
        action, 
        table, 
        req.body, 
        success ? data : null, 
        success ? null : data, 
        success,
        req.get('User-Agent')
      );
      originalJson.call(this, data);
    };
    
    next();
  };
}

module.exports = {
  logAction,
  createLoggerMiddleware
};