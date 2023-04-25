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
  //res.setHeader("Cache-Control", "public, max-age=3, stale-while-revalidate");

  const loggedUser_id = req.query.loggedUser_id || null;
  const username = req.query.username.toLowerCase();

  console.log(username);

  if (!username) {
    res.status(400).json({
      message: "Veuillez fournir un nom d'utilisateur.",
    });
  } else {
    let sql = `
      SELECT
        users.user_id,
        users.username,
        users.display_name,
        users.profile_picture_url,
        users.user_description,
        users.created_at,
        users.updated_at,
        (
          SELECT COUNT(*)
          FROM user_followers AS uf
          WHERE uf.follower_id = users.user_id
        ) AS following_count,
        (
          SELECT COUNT(*)
          FROM user_followers AS uf
          WHERE uf.following_id = users.user_id
        ) AS followers_count,
        (
          SELECT COUNT(*)
          FROM user_followers AS uf
          WHERE uf.follower_id = $2 AND uf.following_id = users.user_id
        ) > 0 AS is_followed_by_current_user
      FROM users
      WHERE username = $1
    `;
    let params = [username, loggedUser_id];

    // limit(() => {
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
        res.status(200).json(user);
      }
    });
    // }).catch((error) => {
    //   // Handle errors
    //   res.status(500).json({
    //     message:
    //       "Une erreur s'est produite lors de la récupération de l'utilisateur.",
    //   });
    // });
  }
});

export default apiRoute;
