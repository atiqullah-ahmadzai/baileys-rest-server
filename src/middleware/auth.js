/**
 * Authentication middleware
 * Validates basic authentication against environment variables
 */
const authenticate = (req, res, next) => {
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }
  
  // Extract credentials
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // Validate against environment variables
    if (
      username === process.env.API_USERNAME &&
      password === process.env.API_PASSWORD
    ) {
      next();
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
    });
  }
};

module.exports = {
  authenticate,
};
