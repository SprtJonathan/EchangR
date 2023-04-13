import connection from "../../db.js";
import Cors from "cors";
import initMiddleware from "../../lib/init-middleware";
import isAuthenticated from "../../lib/isAuthenticated";

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

  const userId = authResult.user?.userId;

  switch (req.method) {
    case "GET": {
      const { postId } = req.query;

      connection.query(
        "SELECT * FROM comments WHERE postId = ?",
        [postId],
        (error, results, fields) => {
          if (error) throw error;
          res.status(200).json(results);
        }
      );

      break;
    }

    case "POST": {
      const { postId, comment } = req.body;

      connection.query(
        "INSERT INTO comments (authorId, postId, comment) VALUES (?, ?, ?)",
        [userId, postId, comment],
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
        "UPDATE comments SET comment = ? WHERE commentId = ? AND authorId = ?",
        [comment, commentId, userId],
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
        "SELECT * FROM comments WHERE commentId = ?",
        [commentId],
        (error, results, fields) => {
          if (error) throw error;

          if (results.length > 0) {
            const comment = results[0];
            if (comment.authorId === userId || roleId > 0) {
              connection.query(
                "DELETE FROM comments WHERE commentId = ?",
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
