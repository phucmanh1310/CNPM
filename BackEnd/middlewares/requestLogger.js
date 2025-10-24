import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Add request ID for tracing
  req.requestId = Math.random().toString(36).substr(2, 9);
  
  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    contentLength: req.get('Content-Length'),
    userId: req.user?.id || 'anonymous'
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    res.responseBody = body;
    return originalJson.call(this, body);
  };
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel]('Request completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length'),
      userId: req.user?.id || 'anonymous'
    });

    // Log errors with more detail
    if (res.statusCode >= 400) {
      logger.error('Request error details', {
        requestId: req.requestId,
        statusCode: res.statusCode,
        responseBody: res.responseBody,
        headers: req.headers
      });
    }
  });
  
  next();
};
