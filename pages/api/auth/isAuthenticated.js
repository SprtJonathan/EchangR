import jwt from "jsonwebtoken";

// Fonction pour vérifier si un utilisateur est authentifié
async function isAuthenticated(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return { isAuthenticated: false, message: "Token absent" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { isAuthenticated: true, user: decoded };
  } catch (error) {
    return { isAuthenticated: false, message: "Token invalide" };
  }
}
