import Task from '../models/Task.js';
import TaskLog from '../models/TaskLog.js';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics for user
// @route   GET /api/analytics/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ assignedTo: userId, status: 'In Progress' });

    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Last 7 days task completion trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const completionTrend = await TaskLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionPercentage,
      completionTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
