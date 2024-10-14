import { WebSocketServer } from "ws";
import { Doc } from "yjs";
import { createYjsServer } from "yjs-server";

const wss = new WebSocketServer({ port: 8080 });
const yjss = createYjsServer({
  createDoc: () => new Doc(),
});

wss.on("connection", (socket, request) => {
  yjss.handleConnection(socket, request);
});
