import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import { sendOTP } from '../utils/sendMail.js';
import asyncHandler from 'express-async-handler';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user & send OTP
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    if (userExists.isVerified) {
      res.status(400);
      throw new Error('User already exists');
    } else {
      // Update unverified user info
      userExists.name = name;
      userExists.password = password;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      userExists.otp = otp;
      userExists.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
      await userExists.save();
      await sendOTP(email, otp);
      return res.status(201).json({ message: 'Verification OTP sent to your email.' });
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  const user = await User.create({
    name,
    email,
    password,
    otp,
    otpExpires,
    isVerified: false,
  });

  if (user) {
    await sendOTP(email, otp);
    res.status(201).json({ message: 'Verification OTP sent to your email.' });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify OTP for registration
// @route   POST /api/auth/verify-otp
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(`[DEBUG] Login Attempt: ${email}`);

  const user = await User.findOne({ email });

  if (!user) {
    console.log(`[DEBUG] Login failed: User not found for ${email}`);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  console.log(`[DEBUG] User found. Checking password...`);
  const isPasswordCorrect = await user.comparePassword(password);
  console.log(`[DEBUG] Password correct: ${isPasswordCorrect}`);
  
  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isGoogleUser = !!user.googleId;
  console.log(`[DEBUG] isVerified: ${user.isVerified}, isGoogleUser: ${isGoogleUser}`);
  
  if (!user.isVerified && !isGoogleUser) {
    console.log('[DEBUG] Login blocked: Not verified');
    res.status(401).json({ 
      message: 'Please verify your email first', 
      needsVerification: true 
    });
    return;
  }

  console.log('[DEBUG] Login successful');
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      username: user.username,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Auth with Google
// @route   POST /api/auth/google
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  console.log('[DEBUG] Google Auth Request Received');

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('[DEBUG] GOOGLE_CLIENT_ID missing');
    res.status(500);
    throw new Error('Google configuration error on server');
  }

  try {
    console.log('[DEBUG] Verifying Google Token...');
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();
    console.log(`[DEBUG] Google Auth Success: ${email}`);

    let user = await User.findOne({ email });

    if (user) {
      user.isVerified = true; 
      if (!user.googleId) {
        user.googleId = sub;
        user.avatar = picture;
      }
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        isVerified: true,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[DEBUG] Google Auth Error:', error.message);
    res.status(400);
    throw new Error('Google authentication failed: ' + error.message);
  }
});

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const emailSent = await sendOTP(email, otp);
  if (emailSent) {
    res.json({ message: 'Password reset OTP sent to your email.' });
  } else {
    res.status(500);
    throw new Error('Failed to send email. Please try again later.');
  }
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.password = password;
  user.isVerified = true; 
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. You can now login.' });
});
