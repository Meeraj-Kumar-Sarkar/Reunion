import nodemailer from 'nodemailer';

export const sendThankYouEmail = async (email, name, amount) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.GOOGLE_APP_PASSWORD) {
      console.warn('Email credentials missing, skipping email sending.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"AlumniFund" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for your generous contribution!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #3b82f6;">Thank You, ${name}!</h2>
          <p style="color: #475569; font-size: 16px;">We have successfully received your contribution of <strong>₹${amount}</strong>.</p>
          <p style="color: #475569; font-size: 16px;">Your generous support helps us continue our legacy and empower the next generation. It is alumni like you who make a difference.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

export const sendVerificationEmail = async (email, name, amount) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.GOOGLE_APP_PASSWORD) {
      console.warn('Email credentials missing, skipping email sending.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

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

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email: ${error.message}`);
  }
};
