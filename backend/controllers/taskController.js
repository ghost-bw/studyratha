import Task from '../models/Task.js';

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, deadline, priority, assignedTo, groupId } = req.body;

  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for user (assigned to them or created by them)
// @route   GET /api/tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ]
    })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('groupId', 'name');
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only assigned user or creator can update status
    if (!task.assignedTo.equals(req.user._id) && !task.createdBy.equals(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks by group
// @route   GET /api/tasks/group/:groupId
export const getTasksByGroup = async (req, res) => {
  try {
    const tasks = await Task.find({ groupId: req.params.groupId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
