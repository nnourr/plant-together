import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import cors from "cors";

import { PORT } from './config.js'
import * as roomRepo from './room/room.repo.js'
import { documentRepo } from './document/document.repo.js';
import { documentSocketRouter } from './document/document.service.js';

const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

app.get('/room/:room_id', async (req, res) => {
  const roomId = req.params.room_id
  if (!roomId) return res.status(400).json({ error: "No Room ID Specified" })

  try {
    const room = await documentRepo.getDocumentsInRoom(roomId)
    res.status(200).json(room)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.post('/room/:room_id', async (req, res) => {
  const room_id = req.params.room_id
  const room_name = req.body.room_name
  const document_name = req.body.document_name

  try {
    await roomRepo.createRoomWithDocument(room_id, room_name, document_name)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.post('/room/:room_id/document/:document_name', async (req, res) => {
  const room_id = req.params.room_id
  const document_name = req.params.document_name

  try {
    await documentRepo.createDocument(room_id, document_name)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

let server;
server = createHttpServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`express server started on ${PORT}`);
});

// Setup document service SocketIO connection
const socketIO = new SocketIOServer(server, { cors: {
  origin: "*"
} });
socketIO.of('/documents').on("connection", (socket) => documentSocketRouter(socketIO, socket));