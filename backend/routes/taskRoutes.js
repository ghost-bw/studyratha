import express from 'express';
import { createTask, getMyTasks, updateTask, updateTaskStatus, getTasksByGroup } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getMyTasks);

router.route('/:id')
  .put(protect, updateTask);

router.patch('/:id/status', protect, updateTaskStatus);
router.get('/group/:groupId', protect, getTasksByGroup);

export default router;
