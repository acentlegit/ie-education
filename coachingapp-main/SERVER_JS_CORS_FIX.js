// CORS Configuration for server.js
// Replace the CORS section in your server.js with this:

const cors = require('cors');

app.use(cors({
  origin: [
    'https://crossskill.net',
    'https://www.crossskill.net',
    'https://d19z8axyv5innr.cloudfront.net',
    'http://coaching-platformm.s3-website-us-east-1.amazonaws.com',
    'https://main.*.amplifyapp.com',
    'http://98.92.71.17:3001',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Make sure this is BEFORE your routes!






