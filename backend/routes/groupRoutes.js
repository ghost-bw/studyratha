import express from 'express';
import { createGroup, joinGroup, getMyGroups, getGroupById, leaveGroup, deleteGroup, addAnnouncement, getAnnouncements } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Announcement routes - moved to top for priority and made explicit
router.get('/:id/announcements', protect, getAnnouncements);
router.post('/:id/announcements', protect, addAnnouncement);

router.route('/')
  .post(protect, createGroup)
  .get(protect, getMyGroups);

router.post('/join', protect, joinGroup);

router.get('/:id', protect, getGroupById);
router.post('/:id/leave', protect, leaveGroup);
router.delete('/:id', protect, deleteGroup);

export default router;
