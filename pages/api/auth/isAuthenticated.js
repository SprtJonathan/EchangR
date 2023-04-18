import jwt from "jsonwebtoken";
import connection from "./../db.js";

// Fonction pour vérifier si un utilisateur est authentifié
export default async function isAuthenticated(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return { isAuthenticated: false, message: "Token absent" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajout d'une requête pour vérifier si l'email est validé
    const query =
      "SELECT email_verification_token FROM users WHERE user_id = $1";
    const { rows } = await connection.query(query, [decoded.user_id]);

    if (rows.length > 0 && rows[0].email_verification_token === null) {
      return { isAuthenticated: true, user: decoded };
    } else {
      return {
        isAuthenticated: false,
        message: "Email non vérifié",
      };
    }
  } catch (error) {
    return { isAuthenticated: false, message: "Token invalide" };
  }
}
