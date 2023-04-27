import jwt from "jsonwebtoken";
import connection from "../../../db.js";

// Generate a new JWT token
export default async function generateToken(user) {
  // Ajout d'une requête pour vérifier si l'email est validé
  const query = "SELECT email_verification_token FROM users WHERE user_id = $1";
  const { rows } = await connection.query(query, [user.user_id]);

  // Si l'email n'est pas vérifié, retournez un message d'erreur
  if (rows.length === 0 || rows[0].email_verification_token !== null) {
    throw new Error("Email non vérifié");
  }
  // console.log(user);

  const date = new Date(user.birth_date);
  const formattedDate = date.toISOString().split("T")[0];

  // Define the data to be encoded in the token
  const data = {
    user_id: user.user_id,
    username: user.username,
    display_name: user.display_name,
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    birth_date: formattedDate,
    role_id: user.role_id,
    profile_picture_url: user.profile_picture_url,
    user_description: user.user_description,
    following: user.following,
    followers: user.followers,
  };

  // Set the options for the token
  const options = {
    expiresIn: "1d",
    issuer: "e-changr.vercel.app",
  };

  // Generate the token and return it
  return jwt.sign(data, process.env.JWT_SECRET, options);
}
