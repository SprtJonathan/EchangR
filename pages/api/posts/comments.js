import connection from "../../../db.js";
import nextConnect from "next-connect";
import isAuthenticated from "../../../lib/isAuthenticated.js";

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// GET apiRoute
apiRoute.get(async (req, res) => {
  const { post_id } = req.query;
  const loggedUser_id = req.query.loggedUser_id || null;
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  console.log(loggedUser_id)

  connection.query(
    `SELECT comments.*, users.username, users.display_name, users.profile_picture_url,
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
      WHERE uf.follower_id = $4 AND uf.following_id = users.user_id
    ) > 0 AS is_followed_by_current_user
    FROM comments
    INNER JOIN users ON comments.author_id = users.user_id
    WHERE post_id = $1
    ORDER BY comments.created_at DESC
    LIMIT $2 OFFSET $3`,
    [post_id, limit, offset, loggedUser_id],
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    }
  );
});

// POST apiRoute
apiRoute.post(async (req, res) => {
  console.log("POST request received");

  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  const { user_id } = authResult.user;

  console.log(user_id);
  const { post_id, comment } = req.body;

  connection.query(
    "INSERT INTO comments (author_id, post_id, comment) VALUES ($1, $2, $3)",
    [user_id, post_id, comment],
    (error, results, fields) => {
      if (error) throw error;
      res.status(201).json({ message: "Comment added." });
    }
  );
});

// PUT apiRoute
apiRoute.put(async (req, res) => {
  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  const { user_id } = authResult;
  const { comment_id, comment } = req.body;

  connection.query(
    "UPDATE comments SET comment = $1 WHERE comment_id = $2 AND author_id = $3",
    [comment, comment_id, user_id],
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
});

// DELETE apiRoute
apiRoute.delete(async (req, res) => {
  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  const { user_id, role_id } = authResult.user;
  const { comment_id, author_id } = req.body;

  connection.query(
    "SELECT * FROM comments WHERE comment_id = $1",
    [comment_id],
    (error, results, fields) => {
      if (error) throw error;
      if (results.rows.length > 0) {
        // const comment = results.rows[0];
        // console.log(comment)
        if (author_id === user_id || role_id > 0) {
          connection.query(
            "DELETE FROM comments WHERE comment_id = $1",
            [comment_id],
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
});

export default apiRoute;
