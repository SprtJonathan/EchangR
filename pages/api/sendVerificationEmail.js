const sendEmail = require("./sendEmail");

export default async function sendVerificationEmail(email, token) {
  const subject = "Vérification de l'adresse email";
  const verificationUrl = `https://e-changr.vercel.app/verify-email?token=${token}`;
  const html = `<p>Merci de vous être inscrit sur E-ChangR. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`;

  return sendEmail(email, subject, html);
}
