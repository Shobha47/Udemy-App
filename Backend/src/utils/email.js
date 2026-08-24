const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Email failed:', error);
    throw error;
  }
}

module.exports = { sendEmail };