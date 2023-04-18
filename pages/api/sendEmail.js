import dotenv from "dotenv";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: "jonathan.binot@gmail.com",
    pass: "0DGIxQhMSvbCm5OF",
  },
});

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: "contact@jonathanbinot.com",
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return { success: false, error };
  }
}

module.exports = sendEmail;
