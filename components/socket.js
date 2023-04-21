import { io } from "socket.io-client";

let socket;

if (typeof window !== "undefined") {
  socket = io(window.location.origin);
}

export default socket;
