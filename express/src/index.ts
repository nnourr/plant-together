import express from "express";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { WebSocketServer } from "ws";
import * as fs from "fs";

import cors from "cors";

// @ts-expect-error import directly from dist folder
import { setupWSConnection } from "../node_modules/y-websocket/bin/utils.cjs";
import {CERT_PATH, KEY_PATH, PORT, SSL_PASS} from './config.js'
import * as roomRepo from './room/room.repo.js'


const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

app.get('/room/:room_id', async (req, res) => {
  const roomId = req.params.room_id
  const room = await roomRepo.getRoomWithDocuments(roomId)
  res.json(room)
})

app.post('/room/:room_id', async (req, res) => {
  const room_id = req.params.room_id
  const room_name = req.body.room_name
  const document_name = req.body.document_name
  await roomRepo.createRoomWithDocument(room_id, room_name, document_name)
  res.sendStatus(200)
})

app.post('/room/:room_id/document/:document_name', async (req, res) => {
  const room_id = req.params.room_id
  const document_name = req.params.document_name
  await roomRepo.createDocumentInRoom(room_id, document_name)
  res.sendStatus(200)
})

let server;
if (KEY_PATH != "" || CERT_PATH != "") {
  const key = fs.readFileSync(KEY_PATH);
  const cert = fs.readFileSync(CERT_PATH);
  server = createHttpsServer(
    {
      key: key,
      cert: cert,
      passphrase: SSL_PASS,
    },
    app
  );
} else {
  console.log("running http");
  server = createHttpServer(app);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`express server started on ${PORT}`);
});

const ws = new WebSocketServer({ server });

ws.on("connection", setupWSConnection);
