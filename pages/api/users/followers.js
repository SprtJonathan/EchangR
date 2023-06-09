import nextConnect from "next-connect";
import connection from "../../../db.js";
import isAuthenticated from "../auth/isAuthenticated";

const handler = nextConnect();

handler.get(async (req, res) => {
  const { user_id } = req.query;

  if (!user_id || isNaN(parseInt(user_id))) {
    res.status(400).json({ message: "User ID invalide." });
    return;
  }

  try {
    const data = {};

    connection.query(
      `
      SELECT uf.following_id
      FROM user_followers AS uf
      WHERE uf.follower_id = $1
    `,
      [user_id],
      (error, followingResults) => {
        if (error) {
          console.error(error);
          res
            .status(500)
            .json({ message: "Erreur lors de la récupération des données." });
          return;
        }

        data.following = followingResults.rows;

        connection.query(
          `
          SELECT uf.follower_id
          FROM user_followers AS uf
          WHERE uf.following_id = $1
        `,
          [user_id],
          (error, followersResults) => {
            if (error) {
              console.error(error);
              res.status(500).json({
                message: "Erreur lors de la récupération des données.",
              });
              return;
            }

            data.followers = followersResults.rows;

            //console.log(data)

            res.status(200).json(data);
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données." });
  }
});

handler.post(async (req, res) => {
  const { follower_id, following_id } = req.body;

  const auth = await isAuthenticated(req);

  if (!auth.isAuthenticated) {
    return res.status(401).json({ message: auth.message });
  }

  if (!follower_id || !following_id) {
    res.status(400).json({ message: "Follower ID ou Following ID manquant." });
    return;
  }

  try {
    connection.query(
      `
      SELECT * FROM user_followers
      WHERE follower_id = $1 AND following_id = $2
    `,
      [follower_id, following_id],
      (error, resultsRows) => {
        const results = resultsRows.rows;

        if (error) {
          console.log(error);
          res
            .status(500)
            .json({ message: "Erreur lors de la vérification du suivi." });
          return;
        }

        if (results.length > 0) {
          // L'utilisateur suit déjà, supprimer le suivi
          connection.query(
            `
            DELETE FROM user_followers
            WHERE follower_id = $1 AND following_id = $2
          `,
            [follower_id, following_id],
            (error) => {
              if (error) {
                res
                  .status(500)
                  .json({ message: "Erreur lors de la suppression du suivi." });
                return;
              }
              res.status(200).json({ message: "Suivi supprimé avec succès." });
            }
          );
        } else {
          // L'utilisateur ne suit pas encore, ajouter le suivi
          connection.query(
            `
            INSERT INTO user_followers (follower_id, following_id)
            VALUES ($1, $2)
          `,
            [follower_id, following_id],
            (error) => {
              if (error) {
                res
                  .status(500)
                  .json({ message: "Erreur lors de l'ajout du suivi." });
                return;
              }
              res
                .status(200)
                .json({ message: "Utilisateur suivi avec succès." });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la gestion du suivi." });
  }
});

export default handler;
