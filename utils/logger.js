const logger = {
  logApi: (endpoint, method, statusCode) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${endpoint} - Status: ${statusCode}`);
  }
};

export { logger }; 