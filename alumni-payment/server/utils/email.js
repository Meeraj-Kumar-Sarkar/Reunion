import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, name, amount, transactionRef) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY missing");
      return { success: false, skipped: true };
    }

    const formattedAmount = Number(amount).toFixed(2);
    const refDisplay = transactionRef || "N/A";

    const { data, error } = await resend.emails.send({
      from: "AlumniFund <no-reply@bnghsreunion.com>",
      to: email,
      subject: `Contribution Verified (Ref: ${refDisplay})`,
      html: `
        <div style="font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #000000; background-color: #ffffff; color: #000000; box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);">
          <h2 style="font-size: 18px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px; border-bottom: 2px solid #000000; padding-bottom: 10px;">
            Payment Confirmed
          </h2>

          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
            Dear <strong>${name}</strong>,
          </p>

          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
            Your payment of <strong style="font-size: 15px;">₹${formattedAmount}</strong> has been successfully confirmed.
          </p>

          <div style="border: 1px solid #000000; padding: 15px; background-color: #fcfcfc; margin: 20px 0; font-size: 13px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #555555; font-weight: bold; border: none;">STATUS:</td>
                <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: bold; border: none;">VERIFIED</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #555555; font-weight: bold; border: none;">AMOUNT:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: bold; border: none;">₹${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #555555; font-weight: bold; border: none;">REFERENCE ID:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: bold; font-family: monospace; border: none;">${refDisplay}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for your generous support of the alumni fund. Your contribution helps us build a stronger community.
          </p>

          <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 25px; font-size: 11px; color: #666666;">
            <p>This is an automated verification receipt. Please keep it for your records.</p>
          </div>
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