const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth');

// Import route modules
const sessionRoutes = require('./session.routes');
const chatRoutes = require('./chat.routes');
const userRoutes = require('./user.routes');

// Health check endpoint (public)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
  });
});

// Protected routes with authentication middleware
router.use('/session', authenticate, sessionRoutes);
router.use('/chats', authenticate, chatRoutes);
router.use('/users', authenticate, userRoutes);

module.exports = router;
