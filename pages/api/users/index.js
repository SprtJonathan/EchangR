import connection from "../../../db.js";
import nextConnect from "next-connect";
import pLimit from "p-limit";

import isAuthenticated from "../../../lib/isAuthenticated.js";

const limit = pLimit(5); // Limite à 5 requêtes simultanées

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// GET all users
apiRoute.get(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");

  const authResult = await isAuthenticated(req);

  if (!authResult.isAuthenticated) {
    res.status(401).json({
      message: authResult.message,
    });
    return;
  }

  const decoded = authResult.user;
  let sql, params;

  if (decoded.role_id > 1) {
    sql =
      "SELECT user_id, username, display_name, profile_picture_url, user_description, fname, lname, created_at, updated_at FROM users";
  } else {
    sql =
      "SELECT user_id, username, display_name, profile_picture_url, user_description, created_at, updated_at FROM users";
  }
  params = [];

  limit(() => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        res.status(500).json({
          message:
            "Une erreur s'est produite lors de la récupération de l'utilisateur.",
        });
      } else {
        res.status(200).json(results);
      }
    });
  }).catch((error) => {
    // Handle errors
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la récupération de l'utilisateur.",
    });
  });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
