import express from 'express';
import { registerUser, loginUser, googleAuth, getUserProfile, verifyOTP, forgotPassword, resetPassword } from '../controllers/authController.js';
import { updateProfilePhoto } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile/photo', protect, upload.single('image'), updateProfilePhoto);

export default router;
