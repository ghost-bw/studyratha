import express from 'express';
import { getMyNotifications, markAsRead, markAllRead, subscribePush } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markAsRead);
router.post('/subscribe', protect, subscribePush);

export default router;
