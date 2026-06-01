import nodemailer from 'nodemailer';

let transporter;

// Create reusable transporter (better performance + connection pooling)
const createTransporter = () => {
  if (!transporter) {
    const emailPass = process.env.GOOGLE_APP_PASSWORD || process.env.EMAIL_PASS;
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPass,
      },
      // Explicit config helps with many hosting environments
      tls: {
        rejectUnauthorized: false // Required in some restricted environments
      }
    });
  }
  return transporter;
};

export const sendVerificationEmail = async (email, name, amount) => {
  try {
    const emailPass = process.env.GOOGLE_APP_PASSWORD || process.env.EMAIL_PASS;
    if (!process.env.EMAIL_USER || !emailPass) {
      console.warn('Email credentials missing, skipping email sending.');
      return { success: false, skipped: true };
    }

    const mailOptions = {
      from: `"AlumniFund" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Payment Has Been Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Payment Verified, ${name}!</h2>
          <p style="color: #475569; font-size: 16px;">We are pleased to confirm that your contribution of <strong>₹${amount}</strong> has been successfully verified.</p>
          <p style="color: #475569; font-size: 16px;">Thank you for your generous support. Your contribution makes a meaningful impact and helps us build a stronger alumni community.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };

    const transport = createTransporter();
    await transport.sendMail(mailOptions);

    console.log(`✅ Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};