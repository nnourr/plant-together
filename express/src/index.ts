import express from "express";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import cors from "cors";

import { PORT, CORS_ALLOWED_ORIGIN } from "./config.js";
import * as roomRepo from "./room/room.repo.js";
import { documentRepo } from "./document/document.repo.js";
import { documentSocketRouter } from "./document/document.service.js";

const app = express();

app.use(express.json());

app.use(cors({ origin: CORS_ALLOWED_ORIGIN }));

app.get("/", (_, res) => {
  res.json({ hello: "world" });
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

let server;
server = createHttpServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`express server started on ${PORT}`);
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


import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_CONFIG, FIREBASE_BAD_REQUEST_ERRRORS, FIREBASE_SERVER_ERRRORS } from "./firebase/firebase.config.js";

// Initialize Firebase
const fireapp = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(fireapp);

app.post("/auth/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return res.status(200).json({ uid: user.uid });
  } catch (error: any) {
    let message = FIREBASE_BAD_REQUEST_ERRRORS[error.code];
    const status = message ? 400 : 500;

    message = message || FIREBASE_SERVER_ERRRORS[error.code] || FIREBASE_SERVER_ERRRORS['auth/internal-error'];
    return res.status(status).json({ error: message });
  }
});

app.post("/auth/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    return res.status(200).json({ token });
  } catch (error: any) {
    let message = FIREBASE_BAD_REQUEST_ERRRORS[error.code];
    const status = message ? 400 : 500;

    message = message || FIREBASE_SERVER_ERRRORS[error.code] || FIREBASE_SERVER_ERRRORS['auth/internal-error'];
    return res.status(status).json({ error: message });
  }
});

