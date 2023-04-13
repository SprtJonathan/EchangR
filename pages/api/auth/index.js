import jwt from "jsonwebtoken";
import Cors from "cors";
import initMiddleware from "../../../lib/init-middleware";

// Initialise le middleware CORS pour les requêtes cross-origin
const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Fonction pour récupérer tous les utilisateurs depuis la base de données
export default async function handler(req, res) {
  // Active le middleware CORS pour toutes les requêtes
  await cors(req, res);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const {
      userId,
      username,
      displayName,
      email,
      roleId,
      profilePictureUrl,
      following,
      followers,
    } = decoded;

    res.status(200).json({
      userId,
      username,
      displayName,
      email,
      roleId,
      profilePictureUrl,
      following,
      followers,
    });
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
}
