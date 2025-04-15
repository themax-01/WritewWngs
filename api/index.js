// This file serves as the entry point for Vercel serverless functions
const express = require('express');
const { createServer } = require('http');

const app = express();
app.use(express.json());

// Set up CORS for frontend access
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Import API routes
const { registerRoutes } = require('../server/routes');
const { setupAuth } = require('../server/auth');

// Set up authentication
setupAuth(app);

// Register API routes
const server = createServer(app);
registerRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Export for Vercel
module.exports = app;