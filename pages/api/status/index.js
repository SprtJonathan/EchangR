import connection from "../../../db.js";
import nextConnect from "next-connect";
import isAuthenticated from "../../../lib/isAuthenticated.js";

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get(async (req, res) => {
  try {
    // Set cache control header
    // res.setHeader(
    //   "Cache-Control",
    //   "public, max-age=10, stale-while-revalidate"
    // );

    const userId = req.query.user_id;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    // const limit = null;
    // const offset = null;

    if (userId) {
      // Si un user_id est fourni, récupérez uniquement les status dont le author_id == user_id
      const { rows } = await connection.query(
        "SELECT * FROM status WHERE author_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3",
        [userId, limit, offset]
      );
      res.status(200).json(rows);
    } else {
      res.status(400).json({ message: "User ID required" });
    }
  } catch (error) {
    console.error("Error in GET route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRoute.post(async (req, res) => {
  try {
    // Set cache control header
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate"
    );

    const authResult = await isAuthenticated(req);
    if (!authResult.isAuthenticated) {
      res.status(401).json({ message: authResult.message });
      return;
    }
    console.log(req.body);
    try {
      const { status } = req.body;
      const author_id = authResult.user.user_id;

      connection.query(
        "INSERT INTO status (date, status, author_id) VALUES (NOW(), $1, $2) RETURNING status_id",
        [status, author_id],
        function (error, results, fields) {
          if (error) {
            console.error("Error inserting status into database:", error);
            res.status(500).json({ message: "Error creating status" });
            return;
          }

          const status_id = results.rows[0].status_id;

          res.status(201).json({
            status_id: status_id,
            status,
            author_id,
          });
        }
      );
    } catch (error) {
      console.error("Error creating status:", error);
      res.status(500).json({ message: "Error creating status" });
    }
  } catch (error) {
    console.error("Error in POST route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

apiRoute.delete(async (req, res) => {
  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  const { user_id, role_id } = authResult.user;
  const { status_id, author_id } = req.body;

  connection.query(
    "SELECT * FROM status WHERE status_id = $1",
    [status_id],
    (error, results, fields) => {
      if (error) throw error;
      if (results.rows.length > 0) {
        // const status = results.rows[0];
        if (author_id === user_id || role_id > 0) {
          connection.query(
            "DELETE FROM status WHERE status_id = $1",
            [status_id],
            (error, results, fields) => {
              if (error) throw error;
              res.status(200).json({ message: "Comment deleted." });
            }
          );
        } else {
          res
            .status(403)
            .json({ message: "Not authorized to delete this status." });
        }
      } else {
        res.status(404).json({ message: "Status not found." });
      }
    }
  );
});

export default apiRoute;
