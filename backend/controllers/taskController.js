import Task from '../models/Task.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, priority, assignedTo, groupId } = req.body;

  const task = await Task.create({
    title,
    description,
    deadline,
    priority,
    assignedTo,
    groupId,
    createdBy: req.user._id,
  });

  res.status(201).json(task);
});

// @desc    Get all tasks for user (assigned to them or created by them)
// @route   GET /api/tasks
export const getMyTasks = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  let query = {
    $or: [
      { assignedTo: req.user._id },
      { createdBy: req.user._id }
    ]
  };

  if (date) {
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
    
    query.deadline = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('groupId', 'name');
    
  res.json(tasks);
});

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Only assigned user or creator can update status
  if (!task.assignedTo.equals(req.user._id) && !task.createdBy.equals(req.user._id)) {
    res.status(401);
    throw new Error('Not authorized to update this task');
  }

  task.status = status;
  await task.save();

  res.json(task);
});

// @desc    Get tasks by group
// @route   GET /api/tasks/group/:groupId
export const getTasksByGroup = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ groupId: req.params.groupId })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');
  res.json(tasks);
});
