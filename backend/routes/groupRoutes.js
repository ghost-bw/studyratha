import express from 'express';
import { createGroup, joinGroup, getMyGroups, getGroupById, leaveGroup, deleteGroup } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createGroup)
  .get(protect, getMyGroups);

router.post('/join', protect, joinGroup);
router.get('/:id', protect, getGroupById);
router.post('/:id/leave', protect, leaveGroup);
router.delete('/:id', protect, deleteGroup);

export default router;
