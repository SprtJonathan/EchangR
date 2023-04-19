import connection from "../../../db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import nextConnect from "next-connect";

import fs from "fs";
import { promisify } from "util";

// Returns a Multer instance that provides several methods for generating
// middleware that process files uploaded in multipart/form-data format.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/posts");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname.replace(/\\/g, "/").replace(/\s+/g, "_")
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Wrong file type");
      error.code = "LIMIT_FILE_TYPES";
      return cb(error, false);
    }
    cb(null, true);
  },
  arrayField: [{ name: "attachments", maxCount: 10 }],
});

const unlinkAsync = promisify(fs.unlink);

async function deleteImage(path) {
  try {
    await unlinkAsync(path);
    console.log("Image supprimée :", path);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image :", error);
  }
}

// Fonction pour vérifier si un utilisateur est authentifié
async function isAuthenticated(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return { isAuthenticated: false, message: "Token absent" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { isAuthenticated: true, user: decoded };
  } catch (error) {
    return { isAuthenticated: false, message: "Token invalide" };
  }
}

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
// Returns middleware that processes multiple files sharing the same field name.
const uploadMiddleware = upload.array("attachment");

// Adds the middleware to Next-Connect
apiRoute.use(uploadMiddleware);

apiRoute.get(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");

  const postId = req.query.id;
  const user_id = req.query.user_id;
  const searchQuery = req.query.searchQuery || "";
  const tagFilter = req.query.tagFilter || null;
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  if (postId) {
    // Si un ID de post est fourni, récupérez uniquement ce post spécifique
    const { rows } = await connection.query(
      "SELECT * FROM posts WHERE id = $1",
      [postId]
    );
    res.status(200).json(rows);
  } else if (user_id) {
    // Si un user_id est fourni, récupérez uniquement les posts dont le author_id == user_id
    const { rows } = await connection.query(
      "SELECT * FROM posts WHERE author_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3",
      [user_id, limit, offset]
    );
    res.status(200).json(rows);
  } else {
    const searchPattern = `%${searchQuery}%`;

    let query = `
      SELECT * FROM posts
      WHERE (COALESCE($2, '') = '' OR tags LIKE $2)
      AND (title LIKE $1 OR description LIKE $1 OR author_id IN (
        SELECT id FROM users WHERE username LIKE $1 OR display_name LIKE $1
      ))
      ORDER BY date DESC LIMIT $3 OFFSET $4
    `;

    const tagPattern = tagFilter ? `%${tagFilter}%` : null;
    const queryParams = [searchPattern, tagPattern, limit, offset];

    const { rows } = await connection.query(query, queryParams);
    res.status(200).json(rows);
  }
});

apiRoute.post(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");

  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  // console.log(req.files);

  try {
    const { title, description, tags } = req.body;
    const author_id = authResult.user.user_id;
    let attachments = req.files;
    let attachmentsPaths = [];

    if (attachments.length) {
      attachments.forEach((attachment) => {
        const path = "/uploads/posts/" + attachment.filename;
        attachmentsPaths.push(`${path}`);
      });
    }

    //console.log(tags);

    connection.query(
      "INSERT INTO posts (title, description, attachment, tags, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [title, description, JSON.stringify(attachmentsPaths), tags, author_id],
      function (error, results, fields) {
        if (error) {
          console.error("Error inserting post into database:", error);
          res.status(500).json({ message: "Error creating post" });
          return;
        }

        const postId = results.rows[0].id;

        res.status(201).json({
          id: postId,
          title,
          description,
          attachmentsPaths,
          tags,
          author_id,
        });
      }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});

apiRoute.put(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");
});

/* PRIORITY : AJOUTER LA SUPPRESSION DES COMMENTAIRES ET REACTIONS LORS DU DELETE */
apiRoute.delete(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");

  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  // Récupère l'ID du post à supprimer depuis les paramètres de l'URL
  const author_id = req.query.author_id;
  const postId = req.query.id;

  const { user_id, role_id } = authResult.user;

  if (user_id == author_id || role_id > 0) {
    try {
      await connection.query("BEGIN");

      const { rows } = await connection.query(
        "SELECT attachment FROM posts WHERE id = $1",
        [postId]
      );

      const attachmentPaths = JSON.parse(rows[0].attachment);

      await connection.query("DELETE FROM comments WHERE post_id = $1", [
        postId,
      ]);

      await connection.query("DELETE FROM reactions WHERE post_id = $1", [
        postId,
      ]);

      await connection.query("DELETE FROM posts WHERE id = $1", [postId]);

      await connection.query("COMMIT");

      if (attachmentPaths.length > 0) {
        for (const path of attachmentPaths) {
          const fullPath = `./public${path}`;
          await deleteImage(fullPath);
        }
      }

      res.status(200).json({ message: "Post supprimé avec succès !" });
    } catch (error) {
      await connection.query("ROLLBACK");
      console.error("Erreur lors de la suppression du post:", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression du post" });
    }
  } else {
    res.status(403).json({ message: "Suppression refusée" });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
