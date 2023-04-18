import { Server } from "ws";
import { createServer } from "http";
import { NextApiResponse, NextApiRequest } from "next";

let server;

function createWebSocketServer(handler) {
  const httpServer = createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.writeHead(200);
    res.end();
  });

  const wsServer = new Server({ server: httpServer });

  wsServer.on("connection", handler);

  return httpServer;
}

export default async function handler(req, res) {
  if (!server) {
    server = createWebSocketServer((socket) => {
      console.log("User connected");

      socket.on("message", (data) => {
        const newMessage = JSON.parse(data);
        console.log("Received:", newMessage);
        socket.send(
          JSON.stringify({ type: "newMessage", payload: newMessage })
        );
      });

      socket.on("close", () => {
        console.log("User disconnected");
      });
    });
  }

  if (req.method === "GET") {
    return new Promise((resolve, reject) => {
      server.on("request", (request, response) => {
        if (request.url === req.url) {
          response.writeHead(200);
          response.end();
          resolve();
        }
      });

      server.emit("request", req, res);
    });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
