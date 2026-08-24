import nodemailer from "nodemailer"
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "us2.smtp.mailhostbox.com", // your SMTP host
  port: 587, // or 25 (for non-SSL), but 587 with STARTTLS is recommended
  secure: false, // use SSL (true) for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASSWORD,    // your email password
  },
  tls: {
    rejectUnauthorized: false, // optional: helps if SSL certificate has issues
  },
});

// Update function to accept an object
export const sendMail = async ({
  to,
  subject,
  emailHtml,
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: emailHtml,
    });
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
