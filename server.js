const next = require("next");
const http = require("http");
const { Server } = require("socket.io");
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("sendMessage", (newMessage) => {
      io.emit("newMessage", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  server.listen(3000, () => {
    console.log("Listening on port 3000");
  });
});
