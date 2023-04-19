import connection from "../../../db.js";
import pLimit from "p-limit";
import nextConnect from "next-connect";

const limit = pLimit(5); // Limite à 5 requêtes simultanées

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");

  const username = req.query.username.toLowerCase();

  console.log(username);

  if (!username) {
    res.status(400).json({
      message: "Veuillez fournir un nom d'utilisateur.",
    });
  } else {
    let sql =
      "SELECT user_id, username, display_name, profile_picture_url, user_description, created_at, updated_at FROM users WHERE username = $1";
    let params = [username];

    limit(() => {
      connection.query(sql, params, (error, results) => {
        if (error) {
          res.status(500).json({
            message:
              "Une erreur s'est produite lors de la récupération de l'utilisateur.",
          });
        } else if (results.rowCount === 0 && username) {
          res.status(404).json({
            message: "L'utilisateur n'a pas été trouvé.",
          });
        } else {
          const user = results.rows[0];
          //console.log(user)

          // Récupérer les utilisateurs suivis
          connection.query(
            `
              SELECT uf.following_id
              FROM user_followers AS uf
              WHERE uf.follower_id = $1
            `,
            [user.user_id],
            (error, following) => {
              if (error) {
                res.status(500).json({
                  message:
                    "Une erreur s'est produite lors de la récupération des utilisateurs suivis.",
                });
                return;
              }

              // Récupérer les followers
              connection.query(
                `
                  SELECT uf.follower_id
                  FROM user_followers AS uf
                  WHERE uf.following_id = $1
                `,
                [user.user_id],
                (error, followers) => {
                  if (error) {
                    res.status(500).json({
                      message:
                        "Une erreur s'est produite lors de la récupération des followers.",
                    });
                    return;
                  }
                  res.status(200).json({ ...user, following, followers });
                }
              );
            }
          );
        }
      });
    }).catch((error) => {
      // Handle errors
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la récupération de l'utilisateur.",
      });
    });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
