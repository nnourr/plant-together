import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import cors from "cors";

import { PORT } from './config.js'
import * as roomRepo from './room/room.repo.js'
import { documentRepo } from './document/document.repo.js';
import { documentSocketIO } from './document/document-service.js';
import { logger } from './logger.js';


const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

app.get('/room/:room_id', async (req, res) => {
  const roomId = req.params.room_id
  const room = await documentRepo.getRoomWithDocuments(roomId)
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
  await documentRepo.createDocumentInRoom(room_id, document_name)
  res.sendStatus(200)
})

let server;
server = createHttpServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`express server started on ${PORT}`);
});

// Setup document service SocketIO connection
const socketIO = new SocketIOServer(server);

socketIO.of('/').on("connection", (socket) => logger.info(`New root namespace socket connection ${socket.id}`));
socketIO.of('/documents').on("connection", (socket) => documentSocketIO(socketIO, socket));