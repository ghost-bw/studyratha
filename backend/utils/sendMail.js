import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Ratha - Your Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #0284c7; text-align: center;">Ratha Verification</h2>
        <p>Hello,</p>
        <p>Your one-time password (OTP) for Ratha is:</p>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border-radius: 8px;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 Ratha. Built for consistency and growth.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};
