import connection from "../../../../db.js";
import nextConnect from "next-connect";
import isAuthenticated from "../../auth/isAuthenticated.js";

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.get(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    res.status(400).json({
      message: "Veuillez fournir un identifiant d'utilisateur valide.",
    });
    return;
  }

  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  const sql = `
  SELECT
  u.userId, u.username, u.displayName, u.profilePictureUrl,
  dm.message_id, dm.sender_id, dm.recipient_id, dm.message, dm.sent_date
FROM users AS u
JOIN direct_messages AS dm ON (u.userId = dm.sender_id OR u.userId = dm.recipient_id)
JOIN (
  SELECT
    MAX(message_id) AS last_message_id
  FROM direct_messages
  WHERE sender_id = $1 OR recipient_id = $1
  GROUP BY LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id)
) AS last_messages ON dm.message_id = last_messages.last_message_id
WHERE (dm.sender_id = $1 OR dm.recipient_id = $1) AND u.userId != $1
ORDER BY dm.sent_date DESC;

      `;

  connection.query(sql, [userId], (error, results) => {
    if (error) {
      res.status(500).json({
        message:
          "Une erreur s'est produite lors de la récupération des conversations.",
      });
    } else {
      res.status(200).json(results);
    }
  });
});

export default apiRoute;
