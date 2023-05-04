import connection from "../../../db.js";
import nextConnect from "next-connect";
import pLimit from "p-limit";
import bcrypt from "bcrypt";

import isAuthenticated from "../../../lib/isAuthenticated.js";

const limit = pLimit(5); // Limite à 5 requêtes simultanées

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// DELETE user account
apiRoute.delete(async (req, res) => {
  const authResult = await isAuthenticated(req);

  if (!authResult.isAuthenticated) {
    res.status(401).json({
      message: authResult.message,
    });
    return;
  }

  const { password } = req.body;
  const user = authResult.user;
  const userId = user.user_id;

  // Verify the provided password
  // Get the current password from the database
  const currentPasswordQuery = "SELECT password FROM users WHERE user_id = $1";
  const currentPasswordResult = await connection.query(currentPasswordQuery, [
    userId,
  ]);

  const currentPasswordInDb = currentPasswordResult.rows[0].password;

  // Check if current password matches the one in the database
  const isMatch = await bcrypt.compare(password, currentPasswordInDb);
  if (!isMatch) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  // Delete associated content and the user account
  const queries = [
    "DELETE FROM posts WHERE author_id = $1",
    "DELETE FROM reactions WHERE user_id = $1",
    "DELETE FROM shared_posts WHERE user_id = $1",
    "DELETE FROM status WHERE author_id = $1",
    "DELETE FROM comments WHERE author_id = $1",
    "DELETE FROM direct_messages WHERE sender_id = $1 OR recipient_id = $1",
    "DELETE FROM unread_messages WHERE user_id = $1",
    "DELETE FROM user_followers WHERE follower_id = $1 OR following_id = $1",
    "DELETE FROM users WHERE user_id = $1",
  ];

  limit(async () => {
    try {
      await connection.query("BEGIN");

      for (const query of queries) {
        await new Promise((resolve, reject) => {
          connection.query(query, [userId], (error) => {
            if (error) {
              return reject(error);
            }
            resolve();
          });
        });
      }
      await connection.query("COMMIT");
      res.status(200).json({ message: "Compte supprimé avec succès." });
    } catch (error) {
      console.log(error);
      await connection.query("ROLLBACK");
      res.status(500).json({
        message: "Erreur lors de la suppression du compte.",
      });
    }
  }).catch((error) => {
    // Handle errors
    console.log(error);
    res.status(500).json({
      message: "Erreur lors de la suppression du compte.",
    });
  });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: true, // Allow body parsing
  },
};
