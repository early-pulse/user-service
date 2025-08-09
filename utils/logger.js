const logger = {
  logApi: (endpoint, method, statusCode) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${endpoint} - Status: ${statusCode}`);
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error ? error.stack || error : '');
  },
  info: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`);
  },
  warn: (message) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`);
  }
};

export { logger }; 