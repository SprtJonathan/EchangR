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
  const postId = req.query.id;
  const userId = req.query.userId;
  const searchQuery = req.query.searchQuery || "";
  const tagFilter = req.query.tagFilter || null;
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  if (postId) {
    // Si un ID de post est fourni, récupérez uniquement ce post spécifique
    connection.query(
      "SELECT * FROM posts WHERE id = $1",
      [postId],
      function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
      }
    );
  } else if (userId) {
    // Si un userId est fourni, récupérez uniquement les posts dont le authorId == userId
    connection.query(
      "SELECT * FROM posts WHERE authorId = $1 ORDER BY date DESC LIMIT $2 OFFSET $3",
      [userId, limit, offset],
      function (error, results, fields) {
        if (error) throw error;
        res.status(200).json(results);
      }
    );
  } else {
    // Si aucun ID de post n'est fourni, récupérez tous les posts
    // console.log(searchQuery);
    // console.log(tagFilter);
    // console.log(limit);
    // console.log(offset);
    
    const searchPattern = `%${searchQuery}%`;

    connection.query(
      `SELECT * FROM posts
       WHERE ($1 IS NULL OR tags LIKE $2)
       AND (title LIKE $3 OR description LIKE $3 OR authorId IN (
         SELECT id FROM users WHERE username LIKE $3 OR displayName LIKE $3
       ))
       ORDER BY date DESC LIMIT $4 OFFSET $5`,
      [
        tagFilter,
        tagFilter ? `%${tagFilter}%` : null,
        searchPattern,
        limit,
        offset,
      ],
      function (error, results, fields) {
        if (error) throw error;
        console.log("Chargement des posts");
        res.status(200).json(results);
      }
    );
  }
});

apiRoute.post(async (req, res) => {
  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  // console.log(req.files);

  try {
    const { title, description, tags } = req.body;
    const authorId = authResult.user.userId;
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
      "INSERT INTO posts (title, description, attachment, tags, authorId) VALUES ($1, $2, $3, $4, $5)",
      [title, description, JSON.stringify(attachmentsPaths), tags, authorId],
      function (error, results, fields) {
        if (error) {
          console.error("Error inserting post into database:", error);
          res.status(500).json({ message: "Error creating post" });
          return;
        }

        const postId = results.insertId;

        res.status(201).json({
          id: postId,
          title,
          description,
          attachmentsPaths,
          tags,
          authorId,
        });
      }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});

apiRoute.put(async (req, res) => {});

/* PRIORITY : AJOUTER LA SUPPRESSION DES COMMENTAIRES ET REACTIONS LORS DU DELETE */
apiRoute.delete(async (req, res) => {
  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  // Récupère l'ID du post à supprimer depuis les paramètres de l'URL
  const authorId = req.query.authorId;
  const postId = req.query.id;

  const { userId, roleId } = authResult.user;

  if (userId == authorId || roleId > 0) {
    connection.beginTransaction(async function (error) {
      if (error) throw error;

      connection.query(
        "SELECT attachment FROM posts WHERE id = $1",
        [postId],
        async function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }

          const attachmentPaths = JSON.parse(results[0].attachment);

          connection.query(
            "DELETE FROM comments WHERE postId = $1",
            [postId],
            function (error, results, fields) {
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }

              connection.query(
                "DELETE FROM reactions WHERE postId = $1",
                [postId],
                function (error, results, fields) {
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }

                  connection.query(
                    "DELETE FROM posts WHERE id = $1",
                    [postId],
                    async function (error, results, fields) {
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }

                      connection.commit(async function (error) {
                        if (error) {
                          return connection.rollback(function () {
                            throw error;
                          });
                        }

                        if (attachmentPaths.length > 0) {
                          for (const path of attachmentPaths) {
                            const fullPath = `./public${path}`;
                            await deleteImage(fullPath);
                          }
                        }

                        res
                          .status(200)
                          .json({ message: "Post supprimé avec succès !" });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
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
