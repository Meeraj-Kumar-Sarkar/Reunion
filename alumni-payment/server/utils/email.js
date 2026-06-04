import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, name, amount) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY missing");
      return { success: false, skipped: true };
    }

    const { data, error } = await resend.emails.send({
      from: "AlumniFund <onboarding@resend.dev>",
      to: process.env.EMAIL_USER,
      subject: "Your Payment Has Been Verified!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Payment Verified, ${name}!</h2>

          <p style="color: #475569; font-size: 16px;">
            We are pleased to confirm that your contribution of
            <strong>₹${amount}</strong> has been successfully verified.
          </p>

          <p style="color: #475569; font-size: 16px;">
            Thank you for your generous support. Your contribution
            makes a meaningful impact and helps us build a stronger
            alumni community.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

          <p style="color: #94a3b8; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false, error };
    }

    console.log(`✅ Verification email sent to ${email}`);
    console.log("Email ID:", data?.id);

    return { success: true, data };
  } catch (error) {
    console.error(
      `❌ Error sending verification email to ${email}:`,
      error.message
    );

    return { success: false, error: error.message };
  }
};