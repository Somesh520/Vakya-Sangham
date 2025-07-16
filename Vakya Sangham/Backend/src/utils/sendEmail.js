import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Vakya Sangham" <${process.env.MAIL_USER}>`,
    to,
    subject: "🔐 Email Verification - Vakya Sangham",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto; background-color: #f9f9f9;">
        <h2 style="color: #2c3e50;">👋 Hello from Vakya Sangham!</h2>
        <p style="font-size: 16px; color: #333;">You're almost ready to start using our platform. Please use the OTP below to verify your email address:</p>
        <div style="font-size: 24px; font-weight: bold; color: #27ae60; margin: 20px 0;">${otp}</div>
        <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">If you didn’t request this, you can safely ignore this email.</p>
        <p style="font-size: 14px; color: #444;">Thanks,<br>The Vakya Sangham Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
