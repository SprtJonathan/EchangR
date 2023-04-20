import connection from "../../../db.js";
import Cors from "cors";
import initMiddleware from "../../../lib/init-middleware.js";
import isAuthenticated from "../../../lib/isAuthenticated.js";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST"],
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated && req.method !== "GET") {
    res.status(401).json({ message: authResult.message });
    return;
  }

  const user_id = authResult.user?.user_id;

  switch (req.method) {
    case "GET": {
      const { post_id } = req.query;

      connection.query(
        "SELECT emoji, COUNT(*) as count FROM reactions WHERE post_id = $1 GROUP BY emoji",
        [post_id],
        (error, results, fields) => {
          if (error) throw error;
          res.status(200).json(results);
        }
      );

      break;
    }

    case "POST": {
      const { post_id, emoji } = req.body;

      connection.query(
        "SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3",
        [post_id, user_id, emoji],
        (error, results, fields) => {
          if (error) throw error;
          //console.log(results)
          if (results.length > 0) {
            connection.query(
              "DELETE FROM reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3",
              [post_id, user_id, emoji],
              (error, results, fields) => {
                if (error) throw error;
                res.status(200).json({ message: "Reaction removed." });
              }
            );
          } else {
            connection.query(
              "INSERT INTO reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)",
              [post_id, user_id, emoji],
              (error, results, fields) => {
                if (error) throw error;
                res.status(201).json({ message: "Reaction added." });
              }
            );
          }
        }
      );

      break;
    }

    default:
      res.status(405).json({ message: "Method not allowed." });
      break;
  }
}
