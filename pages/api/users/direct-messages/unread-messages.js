import connection from "../../../../db.js";
import nextConnect from "next-connect";
import isAuthenticated from "../../auth/isAuthenticated.js";

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Get unread messages
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

  connection.query(
    `
        SELECT dm.senderId, dm.recipientId, dm.message, dm.created_at
        FROM direct_messages AS dm
        INNER JOIN (
          SELECT conversation_id, MIN(id) AS min_id
          FROM unread_messages
          WHERE user_id = ?
          GROUP BY conversation_id
        ) AS um
        ON dm.id = um.min_id
      `,
    [userId],
    (error, results) => {
      if (error) {
        res.status(500).json({
          message:
            "Une erreur s'est produite lors de la récupération des messages non lus.",
        });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// Delete unread messages
apiRoute.delete(async (req, res) => {
  const { userId } = req.query;
  const { messageId } = req.params;

  if (!userId || !messageId) {
    res.status(400).json({
      message:
        "Veuillez fournir un identifiant d'utilisateur et un identifiant de message valides.",
    });
    return;
  }

  const authResult = await isAuthenticated(req);
  if (!authResult.isAuthenticated) {
    res.status(401).json({ message: authResult.message });
    return;
  }

  connection.query(
    "DELETE FROM unread_messages WHERE user_id = ? AND message_id = ?",
    [userId, messageId],
    (error, result) => {
      if (error) {
        res.status(500).json({
          message:
            "Une erreur s'est produite lors de la suppression du message non lu.",
        });
      } else if (result.affectedRows === 0) {
        res.status(404).json({
          message: "Message non lu introuvable.",
        });
      } else {
        res.status(200).json({
          message: "Le message a été marqué comme lu.",
        });
      }
    }
  );
});

export default apiRoute;
