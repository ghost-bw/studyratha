import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  console.log('Testing email with User:', process.env.EMAIL_USER);
  console.log('Password length:', process.env.EMAIL_PASS?.length);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to self
    subject: 'Ratha - Test Email',
    text: 'If you see this, your email configuration is working!',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email Test Failed:');
    console.error(error);
  }
}

testEmail();
