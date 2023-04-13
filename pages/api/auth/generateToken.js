import jwt from "jsonwebtoken";

// Generate a new JWT token
export default function generateToken(user) {
  // Define the data to be encoded in the token
  const data = {
    userId: user.userId,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    roleId: user.roleId,
    profilePictureUrl: user.profilePictureUrl,
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
