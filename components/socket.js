import { io } from "socket.io-client";

const socket = io("https://e-changr.vercel.app/");
export default socket;
