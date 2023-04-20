import connection from "../../db";

export default async function testDbConnection(req, res) {
  console.log("Début de la fonction testDbConnection");

  if (req.method !== "GET") {
    res.status(405).json({ message: "Méthode non autorisée." });
    return;
  }

  try {
    console.log("Tentative de connexion à la base de données");
    const result = await connection.query("SELECT NOW()");
    if (result.rows && result.rows.length > 0) {
      console.log("Connexion à la base de données réussie");
      res.status(200).json({
        message: "Connexion à la base de données réussie!",
        data: result.rows[0],
      });
    } else {
      console.log("Erreur lors de la connexion à la base de données");
      res
        .status(500)
        .json({ message: "Erreur lors de la connexion à la base de données." });
    }
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données: ", error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la connexion à la base de données.",
        error: error.message,
      }); // Ajout de l'erreur dans la réponse
  }
}
