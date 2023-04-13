import connection from "../../../db.js";
import bcrypt from "bcrypt";
import generateToken from "../auth/generateToken";
import multer from "multer";
import nextConnect from "next-connect";

import fs from "fs";
import { promisify } from "util";

// Returns a Multer instance that provides several methods for generating
// middleware that process files uploaded in multipart/form-data format.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/users/profile-pictures");
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
  arrayField: [{ name: "profile_picture", maxCount: 10 }],
});

const unlinkAsync = promisify(fs.unlink);

async function deleteImage(path) {
  try {
    await unlinkAsync(path);
    //console.log("Image supprimée :", path);
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
const uploadMiddleware = upload.single("profile_picture");

// Adds the middleware to Next-Connect
apiRoute.use(uploadMiddleware);

apiRoute.get(async (req, res) => {
  const username = req.query.username;
  const userId = req.query.userId;

  const token = req.headers.authorization;

  if (!userId && !token && !username) {
    res.status(400).json({
      message:
        "Veuillez fournir un identifiant d'utilisateur, un nom d'utilisateur ou un token JWT valide.",
    });
    return;
  }

  let sql, params;

  if (!userId && !username) {
    sql =
      "SELECT userId, username, displayName, profilePictureUrl, userDescription, created_at, updated_at FROM users";
    params = [];
  } else {
    sql =
      "SELECT userId, username, displayName, profilePictureUrl, userDescription, created_at, updated_at FROM users WHERE ";
    if (userId) {
      sql += "userId = ?";
      params = [userId];
    } else {
      sql += "username = ?";
      params = [username];
    }
  }

  connection.query(sql, params, (error, results) => {
    if (error) {
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la récupération de l'utilisateur.",
      });
    } else if (results.length === 0 && (userId || username)) {
      res.status(404).json({
        message: "L'utilisateur n'a pas été trouvé.",
      });
    } else {
      if (!userId && !username) {
        res.status(200).json(results);
      } else {
        const user = results[0];

        // Récupérer les utilisateurs suivis
        connection.query(
          `
          SELECT uf.following_id
          FROM user_followers AS uf
          WHERE uf.follower_id = ?
        `,
          [user.userId],
          (error, following) => {
            if (error) {
              res.status(500).json({
                message:
                  "Une erreur s'est produite lors de la récupération des utilisateurs suivis.",
              });
              return;
            }

            // Récupérer les followers
            connection.query(
              `
              SELECT uf.follower_id
              FROM user_followers AS uf
              WHERE uf.following_id = ?
            `,
              [user.userId],
              (error, followers) => {
                if (error) {
                  res.status(500).json({
                    message:
                      "Une erreur s'est produite lors de la récupération des followers.",
                  });
                  return;
                }
                res.status(200).json({ ...user, following, followers });
              }
            );
          }
        );
      }
    }
  });
});

apiRoute.post(async (req, res) => {
  const { username, displayName, fname, lname, email, password, action } =
    req.body;

  //console.log(req.body);
  if ((action == "signup" && !username) || !email || !password) {
    res.status(400).json({
      message:
        "Veuillez fournir un nom d'utilisateur, une adresse e-mail et un mot de passe valides.",
    });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePictureFile = req.file;
    let profilePictureUrl;
    if (profilePictureFile) {
      profilePictureUrl =
        "/uploads/users/profile-pictures/" + profilePictureFile.filename;
    }

    switch (action) {
      case "signup":
        const newUser = {
          username,
          displayName,
          fname,
          lname,
          email,
          password: hashedPassword,
          profilePictureUrl: profilePictureUrl || "/images/ProfileDefault.png",
        };
        if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
          res.status(400).json({
            message: "L'adresse e-mail fournie n'est pas valide.",
          });
        } else {
          connection.query(
            "INSERT INTO users SET ?",
            newUser,
            (error, result) => {
              if (error) {
                res.status(500).json({
                  message:
                    "Une erreur s'est produite lors de la création de l'utilisateur.",
                });
              } else {
                res.status(201).json({ userId: result.insertId, ...newUser });
              }
            }
          );
        }
        break;

      case "login":
        const userEmail = req.body.email;
        const userPassword = req.body.password;

        let sqlRequest = "SELECT * FROM users WHERE email = ?";
        if (!/^\S+@\S+\.\S+$/.test(userEmail)) {
          sqlRequest = "SELECT * FROM users WHERE username = ?";
        } else {
          sqlRequest = "SELECT * FROM users WHERE email = ?";
        }

        connection.query(sqlRequest, [userEmail], async (error, results) => {
          if (error) {
            res.status(500).json({
              message: "Une erreur s'est produite lors de la connexion.",
            });
          } else if (results.length === 0) {
            res.status(401).json({
              message: "L'adresse e-mail ou le mot de passe est incorrect.",
            });
          } else {
            //console.log(results[0]);
            const user = results[0];
            const passwordMatch = await bcrypt.compare(
              userPassword,
              user.password
            );
            if (passwordMatch) {
              // Récupérer les utilisateurs suivis (following id)
              connection.query(
                `
                  SELECT uf.following_id
                  FROM user_followers AS uf
                  WHERE uf.follower_id = ?
                `,
                [user.userId],
                (error, following) => {
                  if (error) {
                    res.status(500).json({
                      message:
                        "Une erreur s'est produite lors de la récupération des utilisateurs suivis.",
                    });
                    return;
                  }

                  // Récupérer les followers (follower id)
                  connection.query(
                    `
                      SELECT uf.follower_id
                      FROM user_followers AS uf
                      WHERE uf.following_id = ?
                    `,
                    [user.userId],
                    (error, followers) => {
                      if (error) {
                        res.status(500).json({
                          message:
                            "Une erreur s'est produite lors de la récupération des followers.",
                        });
                        return;
                      }

                      const fullUser = {
                        ...user,
                        following: following.map((item) => item.following_id),
                        followers: followers.map((item) => item.follower_id),
                      };

                      const token = generateToken(fullUser); // Generate JWT token
                      res.status(200).json({
                        user,
                        token, // Envoyer le token au client
                      });
                    }
                  );
                }
              );
            } else {
              res.status(401).json({
                message: "L'adresse e-mail ou le mot de passe est incorrect.",
              });
            }
          }
        });
        break;

      default:
        res.status(400).json({ message: "Action non valide." });
        break;
    }
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
