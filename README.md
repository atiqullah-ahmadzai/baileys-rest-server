# Express API Boilerplate

A simple Express.js API boilerplate with authentication, middleware, controllers, and helpers.

## Features

- Express.js server setup
- Simple authentication using environment variables
- API middleware for authentication
- Standardized response format
- Basic error handling
- Sample API endpoints (users)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

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
4. Start the development server:
   ```
   npm run dev
   ```

## API Authentication

This API uses Basic Authentication with a username and password defined in environment variables.

Example request:
```
curl -X GET \
  http://localhost:3000/api/users \
  -H 'Authorization: Basic YWRtaW46c2VjcmV0' \
  -H 'Content-Type: application/json'
```

The default credentials are:
- Username: admin
- Password: secret

## API Endpoints

- `GET /api/health` - Health check (public)
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `POST /api/users` - Create user (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)
