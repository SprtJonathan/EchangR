import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configuration de Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration du stockage pour Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "default",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

// Création d'un middleware Multer qui utilise le stockage Cloudinary
const upload = multer({ storage: storage });

/**
 * Fonction qui upload un fichier vers Cloudinary et retourne l'URL de l'image uploadée
 * @param {Object} file - Objet représentant le fichier à uploader
 * @param {String} folder - Dossier de destination pour l'upload
 * @param {Object} options - Options pour l'upload Cloudinary (facultatif)
 * @returns {Promise<String>} - Promesse qui retourne l'URL de l'image uploadée
 */
export async function uploadImageToCloudinary(
  file,
  folder = "default",
  options = {}
) {
  const result = await cloudinary.v2.uploader.upload(file.path, {
    folder: folder,
    ...options,
  });
  console.log("Uplading image");
  return result.secure_url;
}

export async function deleteImageFromCloudinary(publicId) {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    console.log("Image supprimée :", result);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image :", error);
  }
}
