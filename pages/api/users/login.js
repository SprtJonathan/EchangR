import connection from "../../../db.js";
import bcrypt from "bcrypt";
import pLimit from "p-limit";
import nextConnect from "next-connect";
import generateToken from "../auth/generateToken";

const limit = pLimit(5); // Limite à 5 requêtes simultanées

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
apiRoute.post(async (req, res) => {
  // Set cache control header
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate");
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message:
        "Veuillez fournir une adresse e-mail et un mot de passe valides.",
    });
  } else {
    let sqlRequest =
      "SELECT *, email_verification_token IS NULL AS email_verified FROM users WHERE email = $1";
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      sqlRequest =
        "SELECT *, email_verification_token IS NULL AS email_verified FROM users WHERE username = $1";
    } else {
      sqlRequest =
        "SELECT *, email_verification_token IS NULL AS email_verified FROM users WHERE email = $1";
    }

    limit(() => {
      connection.query(
        sqlRequest,
        [email.toLowerCase()],
        async (error, results) => {
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
            //console.log(user)
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch && user.email_verified) {
              try {
                const followingResults = await new Promise(
                  (resolve, reject) => {
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
                  }
                );
                const followersResults = await new Promise(
                  (resolve, reject) => {
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
                  }
                );

                const fullUser = {
                  ...user,
                  following: followingResults.rows.map(
                    (item) => item.following_id
                  ),
                  followers: followersResults.rows.map(
                    (item) => item.follower_id
                  ),
                };

                const token = await generateToken(fullUser); // Generate JWT token
                //console.log(fullUser);
                res.status(200).json({
                  user,
                  token, // Envoyer le token au client
                });
              } catch (error) {
                res.status(500).json({
                  message:
                    "Une erreur s'est produite lors de la récupération des utilisateurs suivis ou des followers.",
                });
              }
            } else if (!passwordMatch) {
              res.status(401).json({
                message: "L'adresse e-mail ou le mot de passe est incorrect.",
              });
            } else if (!user.email_verified) {
              res.status(401).json({
                message: "Email non vérifié",
              });
            }
          }
        }
      );
    });
  }
});

export default apiRoute;
