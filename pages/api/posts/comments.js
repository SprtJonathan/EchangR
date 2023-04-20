import connection from "../../../db.js";
import Cors from "cors";
import initMiddleware from "../../../lib/init-middleware.js";
import isAuthenticated from "../../../lib/isAuthenticated.js";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
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
        "SELECT * FROM comments WHERE post_id = $1",
        [post_id],
        (error, results, fields) => {
          if (error) throw error;
          res.status(200).json(results);
        }
      );

      break;
    }

    case "POST": {
      const { post_id, comment } = req.body;

      connection.query(
        "INSERT INTO comments (author_id, post_id, comment) VALUES ($1, $2, $3)",
        [user_id, post_id, comment],
        (error, results, fields) => {
          if (error) throw error;
          res.status(201).json({ message: "Comment added." });
        }
      );

      break;
    }

    case "PUT": {
      const { commentId, comment } = req.body;

      connection.query(
        "UPDATE comments SET comment = $1 WHERE comment_id = $2 AND author_id = $3",
        [comment, commentId, user_id],
        (error, results, fields) => {
          if (error) throw error;
          if (results.affectedRows > 0) {
            res.status(200).json({ message: "Comment updated." });
          } else {
            res
              .status(404)
              .json({ message: "Comment not found or not owned by user." });
          }
        }
      );

      break;
    }

    case "DELETE": {
      const { commentId } = req.body;

      connection.query(
        "SELECT * FROM comments WHERE comment_id = $1",
        [commentId],
        (error, results, fields) => {
          if (error) throw error;

          if (results.length > 0) {
            const comment = results[0];
            if (comment.author_id === user_id || role_id > 0) {
              connection.query(
                "DELETE FROM comments WHERE comment_id = $1",
                [commentId],
                (error, results, fields) => {
                  if (error) throw error;
                  res.status(200).json({ message: "Comment deleted." });
                }
              );
            } else {
              res
                .status(403)
                .json({ message: "Not authorized to delete this comment." });
            }
          } else {
            res.status(404).json({ message: "Comment not found." });
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
