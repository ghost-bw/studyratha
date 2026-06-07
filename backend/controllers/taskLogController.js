import TaskLog from '../models/TaskLog.js';
import Task from '../models/Task.js';
import asyncHandler from 'express-async-handler';

// @desc    Log task completion or progress
// @route   POST /api/tasklogs
export const createTaskLog = asyncHandler(async (req, res) => {
  const { taskId, notes, remarks, visibility, status } = req.body;
  
  console.log('--- TaskLog Upload Started ---');
  console.log('Body:', { taskId, notes, status });
  console.log('Number of Files:', req.files?.length || 0);

  const imageUrls = req.files ? req.files.map(file => file.path || file.secure_url) : [];
  console.log('Mapped Image URLs:', imageUrls);

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const taskLog = await TaskLog.create({
    taskId,
    userId: req.user._id,
    notes,
    imageUrls,
    remarks,
    visibility: visibility || 'Group',
  });

  // Update task status if provided, otherwise default to Completed
  const newStatus = status || 'Completed';
  if (task.status !== newStatus) {
    task.status = newStatus;
    await task.save();
  }

  res.status(201).json(taskLog);
});

// @desc    Get task logs for a specific task
// @route   GET /api/tasklogs/task/:taskId
export const getTaskLogsByTask = asyncHandler(async (req, res) => {
  const taskLogs = await TaskLog.find({ taskId: req.params.taskId })
    .populate('userId', 'name email avatar');
  res.json(taskLogs);
});

// @desc    Get all task logs for user
// @route   GET /api/tasklogs/user/:userId
export const getTaskLogsByUser = asyncHandler(async (req, res) => {
  const taskLogs = await TaskLog.find({ userId: req.params.userId })
    .populate('taskId', 'title description')
    .populate('userId', 'name email avatar');
  res.json(taskLogs);
});
