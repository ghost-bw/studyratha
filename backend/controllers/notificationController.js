import Notification from '../models/Notification.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user notifications
// @route   GET /api/notifications
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  notification.isRead = true;
  await notification.save();

  res.json(notification);
});

// @desc    Mark all as read
// @route   PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ message: 'All notifications marked as read' });
});

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
export const subscribePush = asyncHandler(async (req, res) => {
  const subscription = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if subscription already exists
  const exists = user.pushSubscriptions.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    user.pushSubscriptions.push(subscription);
    await user.save();
  }

  res.status(201).json({ message: 'Subscribed to push notifications' });
});
