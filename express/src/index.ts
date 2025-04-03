import express from "express";
import cors from "cors";
import morgan from "morgan";

import loadDependencies from "./dependencies.js";

import { PORT, CORS_ALLOWED_ORIGIN } from "./config.js";
import { logger } from "./logger.js";

import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { v4 as uuidv4 } from 'uuid';

const { 
  roomService, 
  authService,
  documentService,
  roomRepo,
  roomParticipantRepo,
  documentRepo
} = loadDependencies();

const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors({ origin: CORS_ALLOWED_ORIGIN }));

// ----- General Routes -----
app.get("/", (_, res) => {
  res.json({ hello: "world" });
});

// Room endpoints
app.get("/room/public/:room_name", async (req, res) => {
  const roomName = req.params.room_name;
  if (!roomName) return res.status(400).json({ error: "No Room name Specified" });
  try {
    const roomId = await roomRepo.retrieveRoomId(roomName);
    if (!roomId) {
      return res.status(404).json({ error: "Room not found" });
    }
    const room = await roomRepo.getRoomById(roomId);
    const documents = await documentRepo.getDocumentsInRoom(roomId);
    const roomWithDocuments = {
      ...room,
      documents: documents,
    }
    res.status(200).json(roomWithDocuments);
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
});

app.get("/room/private/:owner_id/:room_name", async (req, res) => {
  const roomName = req.params.room_name;
  const ownerId = req.params.owner_id;
  const token = req.headers.authorization;
  const signature = req.query?.signature;
  
  if (!roomName) return res.status(400).json({ error: "No Room name Specified" });
  if (!ownerId) return res.status(400).json({ error: "No owner ID Specified" });
  if (!token) return res.status(401).json({ error: "Unauthorized user" });

  try {
    const roomId = await roomRepo.retrieveRoomId(roomName, ownerId);
    if (!roomId) return res.status(404).json({ error: "Room not found" });

    try {
      if (signature) await roomService.processRoomSignature(token!, roomId, signature as string);
    } catch(error) {
      logger.error(`Failed to process provided signature. Continuing with existing user permissions`);
    }
    
    const room = await roomRepo.getRoomById(roomId);
    const documents = await documentRepo.getDocumentsInRoom(roomId);
    const roomWithDocuments = {
      ...room,
      documents: documents,
    }
    res.status(200).json(roomWithDocuments);
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
});

app.post("/room/:room_name", async (req, res) => {
  const room_name = req.params.room_name;
  const document_name = req.body.document_name;
  const token = req.headers.authorization;
  const is_private = req.body.is_private || false;

  try {
    if (await authService.isGuestUser(token!) && is_private) {
      return res.status(403).json({ error: "Guest Users Cannot Create Private Rooms" });
    }

    if (!is_private && !(await roomService.validatePublicRoomName(room_name))) {
      return res.status(400).json({ error: "Public room name already exists" });
    }

    const ownerId = await authService.getUserId(token!);
    if (!ownerId) return res.status(400).json({ error: "Invalid Token" });

    const roomId = uuidv4();
    await roomRepo.createRoomWithDocument(roomId, room_name, document_name, ownerId, is_private);
    await roomParticipantRepo.addUserAccess(roomId, ownerId);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.put("/room/:room_id/access", async (req, res) => {
  const token = req.headers.authorization;
  const room_id = req.params.room_id;
  const is_private = req.body.is_private;
  if (is_private === undefined) return res.status(400).json({ error: "No is private provided" });

  try {
    if (!(await roomService.validateRoomCreator(token!, room_id))) {
      return res.status(403).json({ error: "Guest user can't change access" });
    }
    await roomService.changeRoomAccess(room_id, is_private);
    res.sendStatus(200);
  }
  catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
});

app.put("/room/share/:room_id", async (req, res) => {
  const roomId = req.params.room_id;
  const token = req.headers.authorization;

  try {
    if (!token) return res.sendStatus(401);
    if (!(await roomService.validateUserPrivateAccess(token!, roomId))) return res.sendStatus(403);

    const signature = await roomService.createRoomSignature(roomId);
    res.status(200).json({ signature });
  }
  catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
});

app.get("/room/:room_id/uml", async (req, res) => {
  const roomId = req.params.room_id;
  let content: any = [];
  const is_private = req.body.is_private || false;
  const token = req.headers.authorization;
  try {
    if (is_private) {
      if (!token) {
        return res.status(401).json({ error: "Unauthorized user" });
      }
      if (!(await roomService.validateRoomCreator(token!, is_private))) {
        return res.status(403).json({ error: "Invalid token" });
      }
      content = await roomService.getUML(roomId);
    }
    else {
      content = await roomService.getUML(roomId);
    }
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
