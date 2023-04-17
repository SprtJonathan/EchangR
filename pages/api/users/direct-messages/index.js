import connection from "../../../../db.js";
import nextConnect from "next-connect";
import isAuthenticated from "../../auth/isAuthenticated.js";

const apiRoute = nextConnect({
  // Handle any other HTTP method
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Get all messages between two users
apiRoute.get(async (req, res) => {
  const { senderId, recipientId } = req.query;

  if (!senderId || !recipientId) {
    res.status(400).json({
      message:
        "Veuillez fournir les identifiants de l'expéditeur et du destinataire.",
    });
    return;
  }

  //  console.log(req.query);

  // const authResult = await isAuthenticated(req);
  // if (!authResult.isAuthenticated) {
  //   res.status(401).json({ message: authResult.message });
  //   return;
  // }

  const sql = `
    SELECT *
    FROM direct_messages
    WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
    ORDER BY sent_date;
  `;

  connection.query(
    sql,
    [senderId, recipientId, recipientId, senderId],
    (error, results) => {
      if (error) {
        res.status(500).json({
          message:
            "Une erreur s'est produite lors de la récupération des messages.",
        });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// Send a new message
apiRoute.post(async (req, res) => {
  const { sender_id, recipient_id, message, sent_date } = req.body;

  if (!sender_id || !recipient_id || !message) {
    res.status(400).json({
      message:
        "Veuillez fournir un expéditeur, un destinataire et un contenu valides.",
    });
    return;
  }

  // const authResult = await isAuthenticated(req);
  // console.log(authResult)
  // if (!authResult.isAuthenticated) {
  //   res.status(401).json({ message: authResult.message });
  //   return;
  // }

  const newMessage = {
    sender_id,
    recipient_id,
    message,
    sent_date,
  };

  console.log(newMessage);

  connection.query(
    "INSERT INTO direct_messages SET ?",
    newMessage,
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          message: "Une erreur s'est produite lors de l'envoi du message.",
        });
      } else {
        const messageId = result.insertId;
        connection.query(
          "INSERT INTO unread_messages (user_id, message_id) VALUES (?, ?)",
          [recipient_id, messageId],
          (error) => {
            if (error) {
              res.status(500).json({
                message:
                  "Une erreur s'est produite lors de l'ajout du message non lu.",
              });
            } else {
              res.status(201).json({ message_id: messageId, ...newMessage });
            }
          }
        );
      }
    }
  );
});

export default apiRoute;
