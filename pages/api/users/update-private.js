import connection from "../../../db.js";
import nextConnect from "next-connect";
import bcrypt from "bcrypt";
import generateToken from "../auth/generateToken";
import isAuthenticated from "../../../lib/isAuthenticated.js";

const apiRoute = nextConnect({
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.put(async (req, res) => {
  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({
      message: authResult.message,
    });
    return;
  }
  // console.log(req.body);
  const decoded = authResult.user;
  const { fname, lname, email, birth_date, password, current_password } =
    req.body;
  const user_id = decoded.user_id;

  // Get the current password from the database
  const currentPasswordQuery = "SELECT password FROM users WHERE user_id = $1";
  const currentPasswordResult = await connection.query(currentPasswordQuery, [
    user_id,
  ]);

  const currentPasswordInDb = currentPasswordResult.rows[0].password;

  // Check if current password matches the one in the database
  const isMatch = await bcrypt.compare(current_password, currentPasswordInDb);
  if (!isMatch) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  let hashedPassword;
  if (password) {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }

  let sql =
    "UPDATE users SET fname = $1, lname = $2, email = $3, birth_date = $4" +
    (password ? ", password = $5" : "") +
    " WHERE user_id = " +
    (password ? "$6" : "$5");
  let params = [fname, lname, email, birth_date].concat(
    password ? [hashedPassword, user_id] : [user_id]
  );

  connection.query(sql, params, async (error, results) => {
    //console.log(error);
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
          const newToken = await generateToken(user); // Generate new JWT token

          res.status(200).json({
            message: "Compte mis à jour avec succès.",
            data: results.rows[0], // Return updated user data
            newToken, // Return new JWT token
          });
        }
      });
    }
  });
});

export default apiRoute;
