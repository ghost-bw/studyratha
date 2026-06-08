import GroupModel from '../models/Group.js'; 
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import { sendNotification } from '../utils/notificationUtils.js';

// @desc    Create a new group
// @route   POST /api/groups
export const createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const group = await GroupModel.create({
    name,
    description,
    admin: req.user._id,
    members: [req.user._id],
    inviteCode,
  });

  res.status(201).json(group);
});

// @desc    Join a group via invite code
// @route   POST /api/groups/join
export const joinGroup = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;

  const group = await GroupModel.findOne({ inviteCode });

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (group.members.some(memberId => memberId.equals(req.user._id))) {
    res.status(400);
    throw new Error('Already a member');
  }

  group.members.push(req.user._id);
  await group.save();

  res.json(group);
});

// @desc    Get user groups
// @route   GET /api/groups
export const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await GroupModel.find({ members: req.user._id })
    .populate('admin', 'name email')
    .populate('members', 'name email avatar');
  res.json(groups);
});

// @desc    Get group details
// @route   GET /api/groups/:id
export const getGroupById = asyncHandler(async (req, res) => {
  const group = await GroupModel.findById(req.params.id)
    .populate('admin', 'name email')
    .populate('members', 'name email avatar');

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (!group.members.some(member => member._id.equals(req.user._id))) {
    res.status(401);
    throw new Error('Not a member of this group');
  }

  res.json(group);
});

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
export const leaveGroup = asyncHandler(async (req, res) => {
  const group = await GroupModel.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (group.admin.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Admin cannot leave the group. Delete the group instead.');
  }

  group.members = group.members.filter(member => member.toString() !== req.user._id.toString());
  await group.save();

  res.json({ message: 'Left the group successfully' });
});

// @desc    Delete a group
// @route   DELETE /api/groups/:id
export const deleteGroup = asyncHandler(async (req, res) => {
  const group = await GroupModel.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (group.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Only admin can delete the group');
  }

  await GroupModel.findByIdAndDelete(req.params.id);
  res.json({ message: 'Group deleted successfully' });
});

// @desc    Add announcement to group
// @route   POST /api/groups/:id/announcements
export const addAnnouncement = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const group = await GroupModel.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (!group.members.some(memberId => memberId.equals(req.user._id))) {
    res.status(401);
    throw new Error('Not a member of this group');
  }

  const announcement = {
    user: req.user._id,
    text,
  };

  group.announcements.unshift(announcement);
  await group.save();

  const updatedGroup = await GroupModel.findById(req.params.id)
    .populate('announcements.user', 'name avatar');
  
  const savedAnnouncement = updatedGroup.announcements[0];

  // Send notifications to all group members except the sender
  group.members.forEach(async (memberId) => {
    if (memberId.toString() !== req.user._id.toString()) {
      await sendNotification({
        recipient: memberId,
        sender: req.user._id,
        type: 'ANNOUNCEMENT',
        title: `New Announcement in ${group.name}`,
        message: text,
        link: `/groups`,
      });
    }
  });

  res.status(201).json(savedAnnouncement);
});

// @desc    Get group announcements
// @route   GET /api/groups/:id/announcements
export const getAnnouncements = asyncHandler(async (req, res) => {
  const group = await GroupModel.findById(req.params.id)
    .populate('announcements.user', 'name avatar');

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (!group.members.some(memberId => memberId.equals(req.user._id))) {
    res.status(401);
    throw new Error('Not a member of this group');
  }

  res.json(group.announcements);
});
