import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://biteyo-be.vercel.app";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
});

export default socket;
