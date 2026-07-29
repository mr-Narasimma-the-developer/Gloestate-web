const nodemailer = require("nodemailer");

// A "transporter" is nodemailer's object that actually knows how to connect
// to an SMTP server and send mail through it. We configure it once here
// and reuse it everywhere we need to send an email.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for port 465, false for port 587 (which we're using)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// A reusable helper so controllers don't repeat transporter.sendMail(...) boilerplate.
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Gloaro Real Estate" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    // We deliberately do NOT throw here. If email fails, the actual
    // message/inquiry should still succeed and save to the database --
    // email is a notification, not the core action. Log it, move on.
    console.error("Email sending failed:", error.message);
  }
};

module.exports = sendEmail;