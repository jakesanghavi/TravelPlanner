process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

// Load Firebase Admin SDK
let db;
try {
  db = await import('./firebase-admin.js');
  console.log('Firebase Admin SDK loaded successfully!');
} catch (err) {
  console.error("Failed to load Firebase Admin SDK:", err);
  process.exit(1);
}

// CORS options: explicitly allow frontend origin
const corsOptions = {
  origin: process.env.ORIGIN, // your React dev server URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));    // use CORS middleware with options
app.use(express.json());       // parse JSON body

import routes from './routes/api-router.js';
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
