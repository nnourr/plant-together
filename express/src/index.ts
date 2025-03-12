import express from "express";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import cors from "cors";

import { PORT, CORS_ALLOWED_ORIGIN } from "./config.js";
import * as roomRepo from "./room/room.repo.js";
import { documentRepo } from "./document/document.repo.js";
import { documentSocketRouter } from "./document/document.service.js";
import { logger } from "./logger.js";

const app = express();

app.use(express.json());

app.use(cors({ origin: CORS_ALLOWED_ORIGIN }));

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

app.get("/room/:room_id/uml", async (req, res) => {
  const roomId = req.params.room_id;
  let content: any = [];
  let room_documents;

  try {
    room_documents = (await documentRepo.getDocumentsInRoom(roomId)).documents;
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Error fetching documents in room" });
  }

  try {
    for (let document of room_documents) {
      content.push({
        docName: document.name,
        uml: await documentRepo.getDocumentUML(roomId, document.id),
      });
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Error extracting uml" });
  }
  res.status(200).json(content);
});

app.get("/room/:room_id", async (req, res) => {
  const roomId = req.params.room_id;
  if (!roomId) return res.status(400).json({ error: "No Room ID Specified" });

  try {
    const room = await documentRepo.getDocumentsInRoom(roomId);
    res.status(200).json(room);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.post("/room/:room_id", async (req, res) => {
  const room_id = req.params.room_id;
  const room_name = req.body.room_name;
  const document_name = req.body.document_name;

  try {
    await roomRepo.createRoomWithDocument(room_id, room_name, document_name);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.post("/room/:room_id/document/:document_name", async (req, res) => {
  const room_id = req.params.room_id;
  const document_name = req.params.document_name;

  try {
    await documentRepo.createDocument(room_id, document_name);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.put("/room/:room_id/document/:document_id/rename", async (req, res) => {
  const room_id = req.params.room_id;
  const document_id = req.params.document_id;
  const new_document_name = req.body.new_document_name;

  try {
    await documentRepo.renameDocument(document_id, new_document_name);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

let server;
server = createHttpServer(app);

server.listen(PORT, "0.0.0.0", () => {
  logger.info(`express server started on ${PORT}`);
});

// Setup document service SocketIO connection
const socketIO = new SocketIOServer(server, {
  cors: {
    origin: CORS_ALLOWED_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["room-id"],
  },
});
socketIO
  .of("/documents")
  .on("connection", (socket) => documentSocketRouter(socketIO, socket));
