import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { io as ClientSocket, Socket as ClientSocketType } from "socket.io-client";

import express from "express";

import { documentSocketRouter } from "../document/document.service.js";
import { logger } from "../logger.js";
import { DocumentResponse } from "../document/document.types.js";
import { documentRepo } from "../document/document.repo.js";
import { createRoomWithDocument } from "../room/room.repo.js";

const PORT = 7570;

describe("Socket.IO Documents Rename Functionality", () => {
  let io: SocketIOServer;
  let server: any;
  let clientSocket: ClientSocketType;

  const DEFAULT_ROOM_ID = "55";
  const DEFAULT_ROOM_NAME = "Room 55";
  const DEFAULT_DOCUMENT_NAME = "Document 1";
  let documentId: string;

  beforeAll(async () => {
    const app = express();
    server = createHttpServer(app);
    io = new SocketIOServer(server);

    io.of("/documents").on("connection", (socket) => documentSocketRouter(io, socket));

    server.listen(PORT, () => {
      console.log(`Test server started on port ${PORT}`);
    });
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  beforeEach(async () => {
    clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, { extraHeaders: { room_id: DEFAULT_ROOM_ID } });
    clientSocket.on("connect", () => expect(clientSocket.connected).toBe(true));

    await createRoomWithDocument(DEFAULT_ROOM_ID, DEFAULT_ROOM_NAME, DEFAULT_DOCUMENT_NAME);
    const documents = await documentRepo.getDocumentsInRoom(DEFAULT_ROOM_ID);
    documentId = documents.documents.find((doc) => doc.name === DEFAULT_DOCUMENT_NAME).id;
  });

  afterEach(async () => {
    if (clientSocket.connected) clientSocket.disconnect();
    await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
  });

  test("should rename a document successfully", (done) => {
    const newDocumentName = "Renamed Document";

    clientSocket.emit("/rename", { documentId, newDocumentName }, async (response: DocumentResponse) => {
      expect(response.status).toBe("SUCCESS");
      expect(response.code).toBe(200);
      expect(response.documentId).toBe(documentId);
      expect(response.newDocumentName).toBe(newDocumentName);

      const updatedDocuments = await documentRepo.getDocumentsInRoom(DEFAULT_ROOM_ID);
      expect(updatedDocuments.documents).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: documentId, name: newDocumentName })])
      );

      done();
    });
  });

  test("should fail to rename a document with an empty name", (done) => {
    clientSocket.emit("/rename", { documentId, newDocumentName: "" }, (response: DocumentResponse) => {
      expect(response.status).toBe("ERROR");
      expect(response.code).toBe(400);
      expect(response.message).toBe("Invalid rename request");
      done();
    });
  });

  test("should fail to rename a document with a missing documentId", (done) => {
    clientSocket.emit("/rename", { newDocumentName: "New Name" }, (response: DocumentResponse) => {
      expect(response.status).toBe("ERROR");
      expect(response.code).toBe(400);
      expect(response.message).toBe("Invalid rename request");
      done();
    });
  });

  test("should notify other clients when a document is renamed", (done) => {
    const newDocumentName = "Updated Name";

    const clientSocket2 = ClientSocket(`http://localhost:${PORT}/documents`, { extraHeaders: { room_id: DEFAULT_ROOM_ID } });

    clientSocket2.on("connect", () => {
      clientSocket.emit("/rename", { documentId, newDocumentName }, (response: DocumentResponse) => {
        expect(response.status).toBe("SUCCESS");
        expect(response.code).toBe(200);
      });

      clientSocket2.on("/document/rename", (message: any) => {
        expect(message).toEqual(
          expect.objectContaining({ documentId, newDocumentName, code: 200 })
        );
        done();
      });
    });
  });
});
