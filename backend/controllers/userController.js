import User from '../models/User.js';

// @desc    Update user profile photo
// @route   PUT /api/auth/profile/photo
export const updateProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    user.avatar = req.file.path || req.file.secure_url;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
