import GroupModel from '../models/Group.js'; 
import crypto from 'crypto';

// @desc    Create a new group
// @route   POST /api/groups
export const createGroup = async (req, res) => {
  const { name, description } = req.body;

  try {
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const group = await GroupModel.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
      inviteCode,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a group via invite code
// @route   POST /api/groups/join
export const joinGroup = async (req, res) => {
  const { inviteCode } = req.body;

  try {
    const group = await GroupModel.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(req.user._id);
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user groups
// @route   GET /api/groups
export const getMyGroups = async (req, res) => {
  try {
    const groups = await GroupModel.find({ members: req.user._id })
      .populate('admin', 'name email')
      .populate('members', 'name email avatar');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group details
// @route   GET /api/groups/:id
export const getGroupById = async (req, res) => {
  try {
    const group = await GroupModel.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some(member => member._id.equals(req.user._id))) {
      return res.status(401).json({ message: 'Not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
export const leaveGroup = async (req, res) => {
  try {
    const group = await GroupModel.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot leave the group. Delete the group instead.' });
    }

    group.members = group.members.filter(member => member.toString() !== req.user._id.toString());
    await group.save();

    res.json({ message: 'Left the group successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
export const deleteGroup = async (req, res) => {
  try {
    const group = await GroupModel.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only admin can delete the group' });
    }

    await GroupModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
