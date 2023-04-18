import { createSocketIOMiddleware } from "next-socket.io";

const handleConnection = (socket) => {
  console.log("User connected");

  socket.on("sendMessage", (newMessage) => {
    socket.broadcast.emit("newMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};

const config = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};

export default createSocketIOMiddleware(handleConnection, config);
