# Baileys REST Server

A REST API server for WhatsApp based on Baileys library.

## Disclaimer

- This is NOT an official API from WhatsApp
- Use at your own risk
- Messages and media files are stored unencrypted in MongoDB and file storage, use at your own risk
- Do not use for spamming

This project is powered by the [Baileys](https://github.com/WhiskeySockets/Baileys) library. Special thanks to the WhiskeySockets team for their amazing work.

## Features

- Express.js server setup
- Simple authentication using environment variables
- API middleware for authentication
- Standardized response format
- Basic error handling
- Send messages to individuals
- Send messages to groups
- Read Audio, Image and Document messages
- Webhook integration
- MongoDB storage
- RESTful API endpoints

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment example file and update it:
   ```
   cp .env.example .env
   ```
4. Configure MongoDB connection and other settings in your .env file
5. Start the development server:
   ```
   npm run dev
   ```

## Setup Guide

1. Configure your MongoDB connection string in the .env file
2. Set up authentication credentials
3. Start the server and scan the QR code to connect your WhatsApp account
4. Configure webhook URL for receiving message notifications (optional)
5. Use the API endpoints to interact with WhatsApp

## API Authentication

This API uses Basic Authentication with a username and password defined in environment variables.

Example request:

## API Documentation

For detailed API documentation with all available endpoints and request/response formats, please refer to our Postman collection:

[Baileys REST API Documentation](https://documenter.getpostman.com/view/15333671/2sB2j1gCPJ)

The collection includes examples for:
- Managing sessions
- Sending different types of messages (text, media, buttons, etc.)
- Group management
- Contact operations
- Status updates
- Webhook configurations

All API requests require authentication as specified in the API Authentication section above.
