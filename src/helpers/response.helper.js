
const createResponse = (res, statusCode, message, data) => {
  const status = statusCode >= 200 && statusCode < 400 ? 'success' : 'error';
  
  return res.status(statusCode).json({
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  createResponse,
};
