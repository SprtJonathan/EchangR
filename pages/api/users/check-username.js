// /api/users/check-username.js
import nextConnect from "next-connect";
import connection from "../../../db.js";

const apiRoute = nextConnect({
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get(async (req, res) => {
  const { username } = req.query;

  if (!username) {
    res
      .status(400)
      .json({ message: "Veuillez fournir un nom d'utilisateur à vérifier." });
  } else {
    connection.query(
      "SELECT COUNT(*) AS count FROM users WHERE username = $1",
      [username],
      (error, result) => {
        if (error) {
          res.status(500).json({
            message: "Erreur lors de la vérification du nom d'utilisateur.",
          });
        } else {
          const results = result.rows;
          if (results && results[0]) {
            res.status(200).json({ available: results[0].count === "0" });
          } else {
            res.status(500).json({
              message:
                "Erreur lors de la récupération du résultat de la requête.",
            });
          }
        }
      }
    );
  }
});

export default apiRoute;
