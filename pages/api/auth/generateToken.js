import jwt from "jsonwebtoken";

// Generate a new JWT token
export default function generateToken(user) {
  // Define the data to be encoded in the token
  const data = {
    user_id: user.user_id,
    username: user.username,
    displayName: user.display_name,
    email: user.email,
    role_id: user.role_id,
    profile_picture_url: user.profile_picture_url,
    following: user.following,
    followers: user.followers,
  };

  // Set the options for the token
  const options = {
    expiresIn: "1d",
    issuer: "chat.ddpcrew.fr",
  };

  // Generate the token and return it
  return jwt.sign(data, process.env.JWT_SECRET, options);
}
