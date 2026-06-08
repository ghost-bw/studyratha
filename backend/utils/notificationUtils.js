import webpush from 'web-push';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

let io;

export const initSocket = (socketIoInstance) => {
  io = socketIoInstance;
  io.on('connection', (socket) => {
    socket.on('setup', (userData) => {
      socket.join(userData._id);
      socket.emit('connected');
    });
  });
};

export const sendNotification = async ({ recipient, sender, type, title, message, link }) => {
  try {
    // 1. Save to MongoDB
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });

    // 2. Send via Socket.IO if user is online
    if (io) {
      io.to(recipient.toString()).emit('notification_received', notification);
    }

    // 3. Send via Web Push for offline/push alerts
    const user = await User.findById(recipient);
    if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
      const payload = JSON.stringify({
        title,
        body: message,
        data: { url: link || '/' },
      });

      const pushPromises = user.pushSubscriptions.map(sub => 
        webpush.sendNotification(sub, payload).catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expired or gone - remove it
            user.pushSubscriptions = user.pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
            user.save();
          }
        })
      );
      await Promise.all(pushPromises);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
