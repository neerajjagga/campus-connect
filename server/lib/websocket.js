import { WebSocketServer } from "ws";
import url from "url";

const CONNECTEDUSERS = new Map();

export const initializeWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, req) => {
    const { userId } = url.parse(req.url, true).query;

    console.log("A User Connected: ", userId);

    CONNECTEDUSERS.set(userId, socket);
    CONNECTEDUSERS.forEach((socket) => {
      socket.send(
        JSON.stringify({
          success: true,
          type: "connection",
          connectedUsers: [...CONNECTEDUSERS.keys()],
        })
      );
    });

    socket.onclose = () => {
      CONNECTEDUSERS.delete(userId);
      CONNECTEDUSERS.forEach((socket) => {
        socket.send(
          JSON.stringify({
            success: true,
            type: "connection",
            connectedUsers: [...CONNECTEDUSERS.keys()],
          })
        );
      });
      console.log("A User Disconnected: ", userId);
    };
  });
};

export function getUserSocket(userId) {
  return CONNECTEDUSERS.get(userId);
}
