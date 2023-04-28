import connection from "../../../db.js";
import multer from "multer";
import fs from "fs";
import { promisify } from "util";
import nextConnect from "next-connect";
import generateToken from "../auth/generateToken";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../cloudinary";

import isAuthenticated from "../../../lib/isAuthenticated.js";

const unlinkAsync = promisify(fs.unlink);

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
});

const apiRoute = nextConnect({
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

const uploadMiddleware = upload.single("profile_picture");

apiRoute.use(uploadMiddleware);

apiRoute.put(async (req, res) => {
  //console.log(req.body);
  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({
      message: authResult.message,
    });
    return;
  }

  const decoded = authResult.user;
  const publicFields = req.body;
  const { username, display_name, description } = publicFields;
  const user_id = decoded.user_id;

  const profilePictureFile = req.file;
  let new_profile_picture_url;
  if (profilePictureFile) {
    const publicId = decoded.profile_picture_url
      .replace(/.*\//, "")
      .split(".")[0];
    const deleteResult = await deleteImageFromCloudinary(publicId);
    new_profile_picture_url = await uploadImageToCloudinary(
      profilePictureFile,
      `uploads/users/profile-pictures/${username}`
    );
  } else {
    // Si aucune nouvelle image n'est uploadée, garder l'ancienne
    new_profile_picture_url = decoded.profile_picture_url;
  }

  let sql =
    "UPDATE users SET username = $1, display_name = $2, user_description = $3, profile_picture_url = $4 WHERE user_id = $5";
  let params = [
    username,
    display_name,
    description,
    new_profile_picture_url,
    user_id,
  ];

  connection.query(sql, params, async (error, results) => {
    if (error) {
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      });
    } else {
      // Récupérer les nouvelles informations de l'utilisateur après la mise à jour
      const updatedUserQuery = "SELECT * FROM users WHERE user_id = $1";
      connection.query(updatedUserQuery, [user_id], async (error, results) => {
        if (error) {
          res.status(500).json({
            message:
              "Une erreur s'est produite lors de la récupération des nouvelles informations de l'utilisateur.",
          });
        } else {
          const user = results.rows[0];
          const followingResults = await new Promise((resolve, reject) => {
            connection.query(
              `
            SELECT uf.following_id
            FROM user_followers AS uf
            WHERE uf.follower_id = $1
          `,
              [user.user_id],
              (error, results) => {
                if (error) reject(error);
                else resolve(results);
              }
            );
          });
          const followersResults = await new Promise((resolve, reject) => {
            connection.query(
              `
            SELECT uf.follower_id
            FROM user_followers AS uf
            WHERE uf.following_id = $1
          `,
              [user.user_id],
              (error, results) => {
                if (error) reject(error);
                else resolve(results);
              }
            );
          });

          const fullUser = {
            ...user,
            following: followingResults.rows.map((item) => item.following_id),
            followers: followersResults.rows.map((item) => item.follower_id),
          };

          const newToken = await generateToken(fullUser); // Generate new JWT token

          res.status(200).json({
            message: "Informations publiques mises à jour avec succès.",
            data: results.rows[0], // Return updated user data
            newToken, // Return new JWT token
          });
        }
      });
    }
  });
});

async function deleteImage(path) {
  try {
    await unlinkAsync("./public/" + path);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image :", error);
  }
}

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};
