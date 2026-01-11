import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendOTPEmail(email: string, otp: string) {
    const mailOptions = {
        from: `"AIESEC Conference" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Your Login Code | AIESEC Conference 2026',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #037Ef3; text-align: center;">Welcome Back</h2>
          <p style="color: #333; font-size: 16px;">Here is your login code for the conference platform:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; padding: 10px 20px; background: #eef6ff; border-radius: 5px; border: 1px solid #037Ef3;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">This code is valid for 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}
