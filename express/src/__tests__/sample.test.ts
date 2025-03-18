import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import {
  io as ClientSocket,
  Socket as ClientSocketType,
} from "socket.io-client";

import express from "express";

import * as encoding from "lib0/encoding";
import * as Y from "yjs";
import * as room from "../room/room.repo.js";
import { jest } from "@jest/globals";
import sql from "../database/database.js";

import { DocumentService } from "../document/document.service.js";
import { logger } from "../logger.js";
import { DocumentResponse } from "../document/document.types.js";
import { DocumentRepo } from "../document/document.repo.js";
import { createRoomWithDocument } from "../room/room.repo.js";
import { RedisClientType } from "redis";
import { mockRedis } from "./__mocks__/redis.mock.js";
import yjsHelpersMock from "./__mocks__/yjs.helpers.mock.js";
import yjsHelpers from "../yjs/yjs.helpers.js";
const PORT = 7565;

const documentRepo = new DocumentRepo(
  sql,
  mockRedis as any as RedisClientType,
  yjsHelpersMock
);
const documentService = new DocumentService(documentRepo);

describe("Repositories", () => {
  beforeAll(async () => {});

  it("does", () => {
    expect(true).toBe(true);
  });

  // describe("Rooms Repository", () => {
  //   const defaultRoomId = "1";
  //   const defaultRoomName = "Room Name Default";
  //   const defaultDocumentName = "Default Document Name";

  //   beforeEach(async () => {
  //     // each test has at least one room and one document
  //     await room.createRoomWithDocument(
  //       defaultRoomId,
  //       defaultRoomName,
  //       defaultDocumentName
  //     );
  //   });

  //   afterEach(async () => {
  //     // undo actions that occurred with the test
  //     await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
  //   });

  //   it("creates room with 1 document", async () => {
  //     const roomId = "100";
  //     const roomName = "Room 100";
  //     const documentName = "Document One";

  //     await room.createRoomWithDocument(roomId, roomName, documentName);
  //     const roomWithDocuments = await documentRepo.getDocumentsInRoom(roomId);

  //     expect(roomWithDocuments?.room_id).toBe(roomId);
  //     expect(roomWithDocuments?.documents).toEqual(
  //       expect.arrayContaining([
  //         expect.objectContaining({ name: documentName }),
  //       ])
  //     );
  //   });

  //   it("adds 1 document to a room", async () => {
  //     const documentName = "Document Two";

  //     await documentRepo.createDocument(defaultRoomId, documentName);
  //     const roomWithDocuments = await documentRepo.getDocumentsInRoom(
  //       defaultRoomId
  //     );

  //     expect(roomWithDocuments?.room_id).toBe(defaultRoomId);
  //     expect(roomWithDocuments?.documents).toEqual(
  //       expect.arrayContaining([
  //         expect.objectContaining({ name: documentName }),
  //       ])
  //     );
  //   });

  //   it("gets documents from a room", async () => {
  //     const roomWithDocuments = await documentRepo.getDocumentsInRoom(
  //       defaultRoomId
  //     );

  //     expect(roomWithDocuments?.room_id).toBe(defaultRoomId);
  //     expect(roomWithDocuments?.documents).toBeInstanceOf(Array);
  //   });
  // });

  describe("Document Repository", () => {
    const room = "testRoom";

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should return the UML text from a Y.Doc", async () => {
      // Create a Y.Doc with some text
      const mockYDoc = new Y.Doc();
      mockYDoc.getText("monaco").insert(0, "Hello, Yjs!");

      // Mock getDoc to return our prepared Y.Doc
      yjsHelpersMock.getDoc.mockResolvedValueOnce(mockYDoc);

      const umlText = await documentRepo.getDocumentUML(room, 2);
      expect(umlText).toBe("Hello, Yjs!");
    });

    it("should return an empty string when no document exists", async () => {
      // Mock getDoc to return an empty Y.Doc
      yjsHelpersMock.getDoc.mockResolvedValueOnce(new Y.Doc());

      const umlText = await documentRepo.getDocumentUML(room, 2);
      expect(umlText).toBe("");
    });
  });
});

// describe("Socket.IO Connections", () => {
//   let io: SocketIOServer;
//   let server: any;
//   let clientSocket: ClientSocketType;

//   beforeAll((done) => {
//     const app = express();
//     server = createHttpServer(app);
//     io = new SocketIOServer(server);

//     io.of("/documents").on("connection", (socket) =>
//       documentService.documentSocketRouter(io, socket)
//     );

//     server.listen(PORT, () => {
//       console.log(`Test server started on port ${PORT}`);
//       done();
//     });
//   });

//   afterAll((done) => {
//     io.close();
//     server.close();
//     done();
//   });

//   afterEach((done) => {
//     if (clientSocket.connected) clientSocket.disconnect();
//     done();
//   });

//   test("should connect to the /documents namespace", (done) => {
//     const callback = (response: any) => {
//       expect(response.status).toBe("SUCCESS");
//       done();
//     };

//     clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, {
//       extraHeaders: { "room-id": "55" },
//     });
//     clientSocket.on("/connection", callback);
//   });
// });

// describe("Socket.IO Documents Namespace", () => {
//   let io: SocketIOServer;
//   let server: any;
//   let clientSocket: ClientSocketType;

//   const DEFAULT_ROOM_ID = "55";
//   const DEFAULT_ROOM_NAME = "Room 55";
//   const DEFAULT_DOCUMENT_NAME = "Document 1";

//   beforeAll(async () => {
//     const app = express();
//     server = createHttpServer(app);
//     io = new SocketIOServer(server);

//     io.of("/documents").on("connection", (socket) =>
//       documentService.documentSocketRouter(io, socket)
//     );

//     server.listen(PORT, () => {
//       console.log(`Test server started on port ${PORT}`);
//     });
//   });

//   afterAll((done) => {
//     io.close();
//     server.close();
//     done();
//   });

//   beforeEach(async () => {
//     clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, {
//       extraHeaders: { "room-id": DEFAULT_ROOM_ID },
//     });
//     clientSocket.on("connect", () => expect(clientSocket.connected).toBe(true));

//     await createRoomWithDocument(
//       DEFAULT_ROOM_ID,
//       DEFAULT_ROOM_NAME,
//       DEFAULT_DOCUMENT_NAME
//     );
//   });

//   afterEach(async () => {
//     if (clientSocket.connected) clientSocket.disconnect();
//     await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
//   });

//   test("should connect to the /documents namespace", (done) => {
//     const callback = (response: any) => {
//       expect(response.status).toBe("SUCCESS");
//       done();
//     };

//     clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, {
//       extraHeaders: { "room-id": DEFAULT_ROOM_ID },
//     });
//     clientSocket.on("/connection", callback);
//   });

//   test("should handle /create event", (done) => {
//     const documentData = { documentName: "Test Document" };
//     const logSpy = jest.spyOn(logger, "info");

//     clientSocket.emit(
//       "/create",
//       documentData,
//       async (response: DocumentResponse) => {
//         expect(response.status).toBe("SUCCESS");
//         expect(response.code).toBe(200);
//         expect(logSpy).toHaveBeenCalledWith(
//           expect.stringContaining("Received event: /create")
//         );

//         const documemts = await documentRepo.getDocumentsInRoom(
//           DEFAULT_ROOM_ID
//         );
//         expect(documemts?.documents).toEqual(
//           expect.arrayContaining([
//             expect.objectContaining({ name: DEFAULT_DOCUMENT_NAME }),
//           ])
//         );

//         done();
//       }
//     );
//   });

//   test("should handle /create event and notify other clients", (done) => {
//     const documentData = { documentName: DEFAULT_DOCUMENT_NAME };
//     const logSpy = jest.spyOn(logger, "info");

//     const clientSocket2 = ClientSocket(`http://localhost:${PORT}/documents`, {
//       extraHeaders: { "room-id": DEFAULT_ROOM_ID },
//     });

//     clientSocket2.on("connect", () => {
//       clientSocket.emit(
//         "/create",
//         documentData,
//         async (response: DocumentResponse) => {
//           expect(response.status).toBe("SUCCESS");
//           expect(response.code).toBe(200);
//           expect(logSpy).toHaveBeenCalledWith(
//             expect.stringContaining("Received event: /create")
//           );

//           const documents = await documentRepo.getDocumentsInRoom(
//             DEFAULT_ROOM_ID
//           );
//           expect(documents?.documents).toEqual(
//             expect.arrayContaining([
//               expect.objectContaining({ name: DEFAULT_DOCUMENT_NAME }),
//             ])
//           );
//         }
//       );

//       clientSocket2.on("/document", (message: any) => {
//         expect(message).toEqual(
//           expect.objectContaining({
//             documentName: DEFAULT_DOCUMENT_NAME,
//             code: 200,
//           })
//         );
//         done();
//       });
//     });
//   });
// });

// const PORT2 = 7570;

// describe("Socket.IO Documents Rename Functionality", () => {
//   let io: SocketIOServer;
//   let server: any;
//   let clientSocket: ClientSocketType;

//   const DEFAULT_ROOM_ID = "55";
//   const DEFAULT_ROOM_NAME = "Room 55";
//   const DEFAULT_DOCUMENT_NAME = "Document 1";
//   let documentId: number;

//   beforeAll(async () => {
//     const app = express();
//     server = createHttpServer(app);
//     io = new SocketIOServer(server);

//     io.of("/documents").on("connection", (socket) =>
//       documentService.documentSocketRouter(io, socket)
//     );

//     server.listen(PORT2, () => {
//       console.log(`Test server started on port ${PORT2}`);
//     });
//   });

//   afterAll((done) => {
//     io.close();
//     server.close();
//     done();
//   });

//   beforeEach(async () => {
//     clientSocket = ClientSocket(`http://localhost:${PORT2}/documents`, {
//       extraHeaders: { "room-id": DEFAULT_ROOM_ID },
//     });
//     clientSocket.on("connect", () => expect(clientSocket.connected).toBe(true));

//     await createRoomWithDocument(
//       DEFAULT_ROOM_ID,
//       DEFAULT_ROOM_NAME,
//       DEFAULT_DOCUMENT_NAME
//     );
//     const documents = await documentRepo.getDocumentsInRoom(DEFAULT_ROOM_ID);
//     const foundDocument = documents.documents.find(
//       (doc) => doc.name === DEFAULT_DOCUMENT_NAME
//     );

//     if (!foundDocument) {
//       throw new Error(
//         `Document with name "${DEFAULT_DOCUMENT_NAME}" not found in room ${DEFAULT_ROOM_ID}`
//       );
//     }

//     documentId = foundDocument.id;
//   });

//   afterEach(async () => {
//     if (clientSocket.connected) clientSocket.disconnect();
//     await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
//   });

//   test("should rename a document successfully", (done) => {
//     const newDocumentName = "Renamed Document";

//     clientSocket.emit(
//       "/rename",
//       { documentId, newDocumentName },
//       async (response: DocumentResponse) => {
//         console.log(response);
//         expect(response.status).toBe("SUCCESS");
//         expect(response.code).toBe(200);
//         expect(response.documentName).toBe(newDocumentName);

//         const updatedDocuments = await documentRepo.getDocumentsInRoom(
//           DEFAULT_ROOM_ID
//         );
//         expect(updatedDocuments.documents).toEqual(
//           expect.arrayContaining([
//             expect.objectContaining({ id: documentId, name: newDocumentName }),
//           ])
//         );

//         console.log("Expecting document name to be updated in the database");

//         done();
//       }
//     );
//   });

//   test("should fail to rename a document with an empty name", (done) => {
//     clientSocket.emit(
//       "/rename",
//       { documentId, newDocumentName: "" },
//       (response: DocumentResponse) => {
//         expect(response.status).toBe("ERROR");
//         expect(response.code).toBe(400);
//         expect(response.message).toBe("Invalid rename request");
//         done();
//       }
//     );
//   });

//   test("should fail to rename a document with a missing documentId", (done) => {
//     clientSocket.emit(
//       "/rename",
//       { newDocumentName: "New Name" },
//       (response: DocumentResponse) => {
//         expect(response.status).toBe("ERROR");
//         expect(response.code).toBe(400);
//         expect(response.message).toBe("Invalid rename request");
//         done();
//       }
//     );
//   });

//   test("should notify other clients when a document is renamed", (done) => {
//     const newDocumentName = "Updated Name";

//     const clientSocket2 = ClientSocket(`http://localhost:${PORT2}/documents`, {
//       extraHeaders: { "room-id": DEFAULT_ROOM_ID },
//     });

//     clientSocket2.on("connect", () => {
//       clientSocket.emit(
//         "/rename",
//         { documentId, newDocumentName },
//         (response: DocumentResponse) => {
//           expect(response.status).toBe("SUCCESS");
//           expect(response.code).toBe(200);
//         }
//       );

//       clientSocket2.on("/document/rename", (message: any) => {
//         expect(message).toEqual(
//           expect.objectContaining({ documentId, newDocumentName, code: 200 })
//         );
//         done();
//       });
//     });
//   });
// });

describe("Yjs Helpers", () => {
  const room = "testRoom";
  const docid = "index";
  const computeKey = yjsHelpers.computeRedisRoomStreamName(room, docid, "y");

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return a Y.Doc with updated 'monaco' text when redis returns an update", async () => {
    const encoder = encoding.createEncoder();
    // Write sync message header (0)
    encoding.writeVarUint(encoder, 0);
    // Write update message type (2)
    encoding.writeVarUint(encoder, 2);
    const ydoc = new Y.Doc();
    const text = ydoc.getText("monaco");
    text.insert(0, "Hello, Yjs!");
    const update = Y.encodeStateAsUpdate(ydoc);
    encoding.writeVarUint8Array(encoder, update);
    const message = encoding.toUint8Array(encoder);

    mockRedis.xRead.mockResolvedValueOnce([
      {
        name: Buffer.from(computeKey),
        messages: [{ message: { m: Buffer.from(message) }, id: "0" }],
      },
    ]);

    expect(ydoc.getText("monaco").toString()).toBe("Hello, Yjs!");

    const retrievedDoc = await yjsHelpers.getDoc(room, mockRedis as any);
    expect(retrievedDoc.getText("monaco").toString()).toBe("Hello, Yjs!");
  });

  it("should return an empty Y.Doc when redis returns null", async () => {
    // Simulate redis.xRead returning null
    mockRedis.xRead.mockResolvedValueOnce(null);
    const retrievedDoc = await yjsHelpers.getDoc(room, mockRedis as any);
    expect(retrievedDoc.getText("monaco").toString()).toBe("");
  });
});
