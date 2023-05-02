import connection from "../../../db.js";
import bcrypt from "bcrypt";
import pLimit from "p-limit";
import { v4 as uuidv4 } from "uuid";
import sendVerificationEmail from "../sendVerificationEmail";
import nextConnect from "next-connect";
import { uploadImageToCloudinary } from "../cloudinary";

import multer from "multer";
import fs from "fs";
import { promisify } from "util";

const limit = pLimit(5); // Limite à 5 requêtes simultanées

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

apiRoute.post(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");

  const {
    username,
    displayName,
    description,
    fname,
    lname,
    email,
    birth_date,
    password,
  } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({
      message:
        "Veuillez fournir un nom d'utilisateur, une adresse e-mail et un mot de passe valides.",
    });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePictureFile = req.file;
    let profile_picture_url;
    if (profilePictureFile) {
      try {
        profile_picture_url = await uploadImageToCloudinary(
          profilePictureFile,
          `uploads/users/profile-pictures/${username}`
        );
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image :", error);
        res.status(500).json({
          message: "Une erreur s'est produite lors de l'upload de l'image.",
        });
        return;
      }
    }
    const newUser = {
      username,
      displayName,
      description: description || "On ne sait pas grand chose à son sujet...",
      fname,
      lname,
      email,
      birth_date,
      password: hashedPassword,
      profile_picture_url: profile_picture_url || "/images/ProfileDefault.png",
    };
    if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
      res.status(400).json({
        message: "L'adresse e-mail fournie n'est pas valide.",
      });
    } else {
      const emailVerificationToken = uuidv4();

      limit(() => {
        connection.query(
          `INSERT INTO users (username, display_name, user_description, fname, lname, email, birth_date, password, profile_picture_url, email_verification_token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            newUser.username,
            newUser.displayName,
            newUser.description,
            newUser.fname,
            newUser.lname,
            newUser.email,
            newUser.birth_date,
            newUser.password,
            newUser.profile_picture_url,
            emailVerificationToken,
          ],
          (error, result) => {
            //console.log(error);
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
      }).catch((error) => {
        // Handle errors
        res.status(500).json({
          message:
            "Une erreur s'est produite lors de la création de l'utilisateur.",
        });
      });
    }
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
