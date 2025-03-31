import express from "express";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { v4 as uuidv4, validate } from 'uuid';

import cors from "cors";
import morgan from "morgan";

import { PORT, CORS_ALLOWED_ORIGIN } from "./config.js";
import * as roomRepo from "./room/room.repo.js";
import { DocumentRepo } from "./document/document.repo.js";
import { DocumentService } from "./document/document.service.js";
import { logger } from "./logger.js";
import { FireauthRepo } from "./firebase/fireauth.repo.js";
import { AuthService } from "./user/auth.service.js";
import { UserRepo } from "./user/user.repo.js";

import sql from "./database/database.js";
import redisClient from "./redis/redis.js";
import { RedisClientType } from "redis";
import { RoomService } from "./room/room.service.js";
import yjsHelpers from "./yjs/yjs.helpers.js";

// ----- Dependency Injection for Authentication -----
// Create instances of FireauthRepo and UserRepo and inject them into AuthService.
const fireauth = FireauthRepo.instance();
const userRepo = new UserRepo();
const authService = new AuthService(fireauth, userRepo);

// ----- Setup Document & Room Services -----
const documentRepo = new DocumentRepo(
  sql,
  redisClient as RedisClientType,
  yjsHelpers
);
const documentService = new DocumentService(documentRepo);
const roomService = new RoomService(documentRepo, authService);

const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors({ origin: CORS_ALLOWED_ORIGIN }));

// ----- General Routes -----
app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

// Room endpoints
app.get("/room/:room_name", async (req, res) => {
  const roomName = req.params.room_name;
  if (!roomName) return res.status(400).json({ error: "No Room name Specified" });
  try {
    const roomId = await roomRepo.retrieveRoomId(roomName);
    const room = roomId ? await documentRepo.getDocumentsInRoom(roomId) : {};
    res.status(200).json(room);
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
});

app.post("/room/:room_id", async (req, res) => {
  const room_id = req.params.room_id;
  const room_name = req.body.room_name;
  const document_name = req.body.document_name;
  const token = req.headers.authorization;
  const is_private = req.body.is_private || false;

  try {
    if (!(await roomService.validateRoomCreator(token!, is_private))) {
      return res.status(400).json({ error: "Invalid room creator" });
    }

    if(!is_private && !(await roomService.validatePublicRoomName(room_name))) {
      return res.status(400).json({ error: "Public room name already exists" });
    }

    const ownerId = await authService.getUserId(token!);
    if (!ownerId) return res.status(400).json({ error: "No owner" });
    await roomRepo.createRoomWithDocument(uuidv4(), room_name, document_name, ownerId, is_private);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.get("/room/:room_id/uml", async (req, res) => {
  const roomId = req.params.room_id;
  let content: any = [];
  try {
    content = await roomService.getUML(roomId);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Error extracting uml" });
  }
  res.status(200).json(content);
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


// Auth endpoints using dependency-injected authService
app.post("/auth/signup", async (req, res) => {
  const { displayName, email, password } = req.body;
  if (!displayName || !email || !password) {
    return res.status(400).json({ error: "Invalid request: Missing required fields" });
  }
  try {
    const token = await authService.signUpWithEmailPassword(displayName, email, password);
    return res.status(200).json({ token });
  } catch (error: any) {
    return res.status(error?.status || 500).json({
      error: error?.error || "An unexpected error occurred. Please try again later.",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await authService.loginWithEmailPassword(email, password);
    return res.status(200).json({ token });
  } catch (error: any) {
    return res.status(error?.status || 500).json({
      error: error?.error || "An unexpected error occurred. Please try again later.",
    });
  }
});

app.get("/auth/guest", async (req, res) => {
  try {
    const token = await authService.guestLogin();
    return res.status(200).json({ token });
  } catch (error: any) {
    return res.status(error?.status || 500).json({
      error: error?.error || "An unexpected error occurred. Please try again later.",
    });
  }
});

app.get("/auth/verify", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const isValid = await authService.verifyToken(token);
    if (isValid) return res.sendStatus(200);
    return res.sendStatus(403);
  } catch (error: any) {
    return res.status(500).json({
      error: "An unexpected error occurred. Please try again later."
    });
  }
});

app.get("/user/displayname", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(400).json({ error: "No Token Provided" });
  try {
    const displayName = await authService.getDisplayName(token);
    return res.status(200).json({ displayName });
  } catch (error) {
    return res.sendStatus(500);
  }
});

// ----- Setup HTTP & Socket.IO Server -----
let server = createHttpServer(app);
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Express server started on ${PORT}`);
});

const socketIO = new SocketIOServer(server, {
  cors: {
    origin: CORS_ALLOWED_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["room-id", "Authorization"],
  },
});

socketIO
  .of("/documents")
  .on("connection", (socket) =>
    documentService.documentSocketRouter(socketIO, socket)
  );

export { app, server };
