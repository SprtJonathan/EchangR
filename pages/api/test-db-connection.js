import connection from "../../db";

export default async function testDbConnection(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Méthode non autorisée." });
    return;
  }

  try {
    const result = await connection.query("SELECT NOW()");
    if (result.rows && result.rows.length > 0) {
      res.status(200).json({
        message: "Connexion à la base de données réussie!",
        data: result.rows[0],
      });
    } else {
      res
        .status(500)
        .json({ message: "Erreur lors de la connexion à la base de données." });
    }
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données: ", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la connexion à la base de données." });
  }
}
