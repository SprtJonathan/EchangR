require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

async function sendEmail(to, subject, html) {
  sendSmtpEmail = {
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
    sender: { email: process.env.SMTP_FROM_EMAIL },
  };
  console.log("sendEmail function called");
  try {
    console.log("sending email...");
    let data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("email :" + data);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return { success: false, error };
  }
}

module.exports = sendEmail;
