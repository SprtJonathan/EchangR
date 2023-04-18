import connection from "../../../db.js";
import nextConnect from "next-connect";

const apiRoute = nextConnect({
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ message: "Token de vérification manquant." });
    return;
  }

  connection.query(
    "UPDATE users SET email_verification_token = NULL WHERE email_verification_token = $1 RETURNING *",
    [token],
    (error, results) => {
      if (error) {
        res
          .status(500)
          .json({
            message:
              "Une erreur s'est produite lors de la vérification de l'email.",
          });
      } else if (results.rowCount === 0) {
        res
          .status(404)
          .json({ message: "Token de vérification non valide ou expiré." });
      } else {
        res.status(200).json({ message: "Email vérifié avec succès !" });
      }
    }
  );
});

export default apiRoute;
