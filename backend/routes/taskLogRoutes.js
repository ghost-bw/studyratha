import express from 'express';
import { createTaskLog, getTaskLogsByTask, getTaskLogsByUser } from '../controllers/taskLogController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.array('images', 5), createTaskLog);
router.get('/task/:taskId', protect, getTaskLogsByTask);
router.get('/user/:userId', protect, getTaskLogsByUser);

export default router;
