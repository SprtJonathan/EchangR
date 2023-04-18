import connection from "../../../db.js";
import bcrypt from "bcrypt";
import generateToken from "../auth/generateToken";
import multer from "multer";
import nextConnect from "next-connect";

import fs from "fs";
import { promisify } from "util";

import sendVerificationEmail from "../sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";

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
  fields: [{ name: "profile_picture", maxCount: 10 }], // Si ça ne fonctionne plus, retourner à arrayFields
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

// GET
apiRoute.get(async (req, res) => {
  const username = req.query.username;
  const user_id = req.query.user_id;

  console.log(req.query);

  const token = req.headers.authorization;

  //console.log(req.query)

  if (!user_id && !token && !username) {
    res.status(400).json({
      message:
        "Veuillez fournir un identifiant d'utilisateur, un nom d'utilisateur ou un token JWT valide.",
    });
    return;
  }

  let sql, params;

  if (!user_id && !username) {
    sql =
      "SELECT user_id, username, display_name, profile_picture_url, user_description, created_at, updated_at FROM users";
    params = [];
  } else {
    sql =
      "SELECT user_id, username, display_name, profile_picture_url, user_description, created_at, updated_at FROM users WHERE ";
    if (user_id) {
      sql += "user_id = $1";
      params = [user_id];
    } else {
      sql += "username = $1";
      params = [username];
    }
  }

  connection.query(sql, params, (error, results) => {
    if (error) {
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la récupération de l'utilisateur.",
      });
    } else if (results.rowCount === 0 && (user_id || username)) {
      res.status(404).json({
        message: "L'utilisateur n'a pas été trouvé.",
      });
    } else {
      if (!user_id && !username) {
        res.status(200).json(results);
      } else {
        const user = results.rows[0];
        //console.log(user)

        // Récupérer les utilisateurs suivis
        connection.query(
          `
          SELECT uf.following_id
          FROM user_followers AS uf
          WHERE uf.follower_id = $1
        `,
          [user.user_id],
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
              WHERE uf.following_id = $1
            `,
              [user.user_id],
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
    let profile_picture_url;
    if (profilePictureFile) {
      profile_picture_url =
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
          profile_picture_url:
            profile_picture_url || "/images/ProfileDefault.png",
        };
        if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
          res.status(400).json({
            message: "L'adresse e-mail fournie n'est pas valide.",
          });
        } else {
          const emailVerificationToken = uuidv4();

          connection.query(
            `INSERT INTO users (username, display_name, fname, lname, email, password, profile_picture_url, email_verification_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              newUser.username,
              newUser.displayName,
              newUser.fname,
              newUser.lname,
              newUser.email,
              newUser.password,
              newUser.profile_picture_url,
              emailVerificationToken,
            ],
            (error, result) => {
              console.log(error);
              if (error) {
                res.status(500).json({
                  message:
                    "Une erreur s'est produite lors de la création de l'utilisateur.",
                });
              } else {
                sendVerificationEmail(newUser.email, emailVerificationToken);
                res.status(201).json({ user_id: result.insertId, ...newUser });
              }
            }
          );
        }
        break;

      case "login":
        const userEmail = req.body.email;
        const userPassword = req.body.password;

        let sqlRequest = "SELECT * FROM users WHERE email = $1";
        if (!/^\S+@\S+\.\S+$/.test(userEmail)) {
          sqlRequest = "SELECT * FROM users WHERE username = $1";
        } else {
          sqlRequest = "SELECT * FROM users WHERE email = $1";
        }

        connection.query(sqlRequest, [userEmail], async (error, results) => {
          if (error) {
            res.status(500).json({
              message: "Une erreur s'est produite lors de la connexion.",
            });
          } else if (results.rowCount === 0) {
            res.status(401).json({
              message: "L'adresse e-mail ou le mot de passe est incorrect.",
            });
          } else {
            const user = results.rows[0];
            // console.log(user);
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
    WHERE uf.follower_id = $1
  `,
                [user.user_id],
                (error, followingResults) => {
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
        WHERE uf.following_id = $1
      `,
                    [user.user_id],
                    (error, followersResults) => {
                      if (error) {
                        res.status(500).json({
                          message:
                            "Une erreur s'est produite lors de la récupération des followers.",
                        });
                        return;
                      }

                      const fullUser = {
                        ...user,
                        following: followingResults.rows.map(
                          (item) => item.following_id
                        ),
                        followers: followersResults.rows.map(
                          (item) => item.follower_id
                        ),
                      };

                      const token = generateToken(fullUser); // Generate JWT token
                      console.log(fullUser);
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
