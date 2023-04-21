import Pusher from "pusher";

const pusher = new Pusher({
  appId: "1588105",
  key: "c5177ffd69682f39d63b",
  secret: "1a59d3615384b0632822",
  cluster: "eu",
  useTLS: true,
});

export default async (req, res) => {
  if (req.method === "POST") {
    const { socket_id, channel_name } = req.body;
    try {
      const auth = pusher.authenticate(socket_id, channel_name);
      res.status(200).json(auth);
    } catch (error) {
      console.error("Error authenticating Pusher channel:", error);
      res.status(500).json({ error: "Error authenticating Pusher channel" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
