require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const WhatsAppHelper = require('./helpers/whatsapp.helper');
const { connectToDatabase} = require('./helpers/database.helper');

// Import routes
const routes = require('./routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Request logging

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		status: 'error',
		message: 'Something went wrong!',
	});
});

// allow data folder to be accessed from outside the container
app.use('/data', express.static('data'));

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		status: 'error',
		message: 'Route not found',
	});
});

// Start server
app.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`);
	// Initialize database connection
	connectToDatabase();
	//Start WhatsApp connection
	if (process.env.AUTO_START == 'true') {

		try {
			const sock = await WhatsAppHelper.initialize();
			
		} catch (error) {
			console.error('Failed to initialize WhatsApp connection:', error);
		}
	}
});
