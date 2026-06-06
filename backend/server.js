import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes imports
import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import taskLogRoutes from './routes/taskLogRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ratha';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasklogs', taskLogRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Ratha API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
