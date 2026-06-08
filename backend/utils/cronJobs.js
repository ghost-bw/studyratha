import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendNotification } from './notificationUtils.js';

const initCronJobs = () => {
  // 1. Task Deadline Reminder: Runs every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running task deadline reminder cron job...');
    try {
      const threeHoursFromNow = new Date();
      threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
      
      const windowStart = new Date(threeHoursFromNow);
      windowStart.setMinutes(0, 0, 0);
      
      const windowEnd = new Date(threeHoursFromNow);
      windowEnd.setMinutes(59, 59, 999);

      const tasks = await Task.find({
        deadline: { $gte: windowStart, $lte: windowEnd },
        status: { $ne: 'Completed' }
      }).populate('assignedTo');

      for (const task of tasks) {
        await sendNotification({
          recipient: task.assignedTo._id,
          type: 'TASK_DEADLINE',
          title: 'Upcoming Task Deadline',
          message: `Your task "${task.title}" is due in 3 hours!`,
          link: '/tasks',
        });
      }
      console.log(`Sent ${tasks.length} deadline reminders.`);
    } catch (error) {
      console.error('Error in deadline reminder cron job:', error);
    }
  });

  // 2. Daily Study and Task Update Reminder: Runs at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily study reminder cron job...');
    try {
      const users = await User.find({});
      for (const user of users) {
        const pendingTasksCount = await Task.countDocuments({
          assignedTo: user._id,
          status: { $ne: 'Completed' }
        });

        await sendNotification({
          recipient: user._id,
          type: 'DAILY_REMINDER',
          title: 'Daily Study Reminder',
          message: pendingTasksCount > 0 
            ? `Good morning! You have ${pendingTasksCount} pending tasks today. Let's get to work!` 
            : `Good morning! You're all caught up. Ready to set new goals?`,
          link: '/dashboard',
        });
      }
    } catch (error) {
      console.error('Error in daily reminder cron job:', error);
    }
  });

  // 3. Task Cleanup: Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily task cleanup cron job...');
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = await Task.deleteMany({
        deadline: { $lt: threeDaysAgo }
      });

      console.log(`Deleted ${result.deletedCount} expired tasks.`);
    } catch (error) {
      console.error('Error in task cleanup cron job:', error);
    }
  });
};

export default initCronJobs;
