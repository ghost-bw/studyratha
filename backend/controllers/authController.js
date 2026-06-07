import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import { sendOTP } from '../utils/sendMail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user & send OTP
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP for registration
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`--- Login Attempt: ${email} ---`);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 1. Check password first
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      console.log('Login failed: Incorrect password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Then check verification status
    // Google users are auto-verified
    const isGoogleUser = !!user.googleId;
    console.log(`User Verification State - isVerified: ${user.isVerified}, isGoogleUser: ${isGoogleUser}`);
    
    if (!user.isVerified && !isGoogleUser) {
      console.log('Login blocked: Email not verified. Sending to OTP flow.');
      return res.status(401).json({ 
        message: 'Please verify your email first', 
        needsVerification: true 
      });
    }

    console.log('Login successful');
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
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
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Auth with Google
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();
    console.log(`--- Google Auth: ${email} ---`);

    let user = await User.findOne({ email });

    if (user) {
      console.log('Existing user found, updating Google ID and verification status');
      user.isVerified = true; // Always verified via Google
      if (!user.googleId) {
        user.googleId = sub;
        user.avatar = picture;
      }
      await user.save();
    } else {
      console.log('Creating new Google user');
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        isVerified: true, // New Google users are auto-verified
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
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('--- Forgot Password Request ---');
  console.log('Email:', email);
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log('OTP generated and saved for user');

    const emailSent = await sendOTP(email, otp);
    if (emailSent) {
      console.log('OTP email sent successfully to:', email);
      res.json({ message: 'Password reset OTP sent to your email.' });
    } else {
      console.error('Failed to send OTP email via sendOTP utility');
      res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  console.log('--- Reset Password Request ---');
  console.log('Email:', email, 'OTP:', otp);

  try {
    const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!user) {
      console.log('Invalid or expired OTP for:', email);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.isVerified = true; // Auto-verify if they successfully reset via OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    console.log('Password reset and user verified successfully for:', email);

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
};
