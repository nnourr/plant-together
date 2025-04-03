import express from "express";
import signed from "signed";
import sql from "../database/database.js";
import postgres from "postgres";

import yjsHelpersMock from "./__mocks__/yjs.helpers.mock.js";
import yjsHelpers from "../yjs/yjs.helpers.js";

import * as encoding from "lib0/encoding";
import * as Y from "yjs";

import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import {
  io as ClientSocket,
  Socket as ClientSocketType,
} from "socket.io-client";

import { v4 as uuidv4 } from 'uuid';

import { RoomService } from "../room/room.service.js";

import { jest } from "@jest/globals";
import { authServiceMock } from './__mocks__/auth.service.mock.js';
import { roomRepoMock } from "./__mocks__/room.repo.mock.js";
import { documentRepoMock } from "./__mocks__/document.repo.mock.js";
import { participantRepoMock } from "./__mocks__/participant.repo.mock.js";
import { mockRedis } from "./__mocks__/redis.mock.js";

import { DocumentService } from "../document/document.service.js";
import { logger } from "../logger.js";
import { DocumentResponse } from "../document/document.types.js";
import { DocumentRepo } from "../document/document.repo.js";
import { RoomParticipantRepo } from "../room/participant.repo.js";
import { RoomRepo } from "../room/room.repo.js";
import { RedisClientType } from "redis";
import { AuthService } from "../user/auth.service.js";

const PORT = 7565;

jest.setTimeout(10000);

const documentRepo = new DocumentRepo(
  sql,
  mockRedis as any as RedisClientType,
  yjsHelpersMock
);

const roomRepo = new RoomRepo();
const participantRepo = new RoomParticipantRepo(sql);

const documentService = new DocumentService(documentRepo);

describe("Repositories", () => {
  beforeAll(async () => {});

  it("does", () => {
    expect(true).toBe(true);
  });

  describe("Rooms Repository", () => {
    const defaultRoomId = "1";
    const defaultRoomName = "Room Name Default";
    const defaultDocumentName = "Default Document Name";
    const defaultOwnerId = "00000000-0000-0000-0000-000000000000";
    const isPrivate = false;

    beforeEach(async () => {
      // each test has at least one room and one document
      await roomRepo.createRoomWithDocument(
        defaultRoomId,
        defaultRoomName,
        defaultDocumentName,
        defaultOwnerId,
        isPrivate
      );
    });

    afterEach(async () => {
      // undo actions that occurred with the test
      await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
    });

    it("creates room with 1 document", async () => {
      const roomId = "100";
      const roomName = "Room 100";
      const documentName = "Document One";

      await roomRepo.createRoomWithDocument(roomId, roomName, documentName, defaultOwnerId, false);
      const roomWithDocuments = await documentRepo.getDocumentsInRoom(roomId);

      expect(roomWithDocuments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: documentName }),
        ])
      );
    });

    it("adds 1 document to a room", async () => {
      const documentName = "Document Two";

      await documentRepo.createDocument(defaultRoomId, documentName);
      const roomWithDocuments = await documentRepo.getDocumentsInRoom(
        defaultRoomId
      );

      expect(roomWithDocuments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: documentName }),
        ])
      );
    });

    it("gets documents from a room", async () => {
      const roomWithDocuments = await documentRepo.getDocumentsInRoom(
        defaultRoomId
      );

      expect(roomWithDocuments).toBeInstanceOf(Array);
    });
  });

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

  describe("Participant Repository", () => {
    const defaultRoomId = "32332323232";
    const defaultRoomName = "Room Name Default";
    const defaultDocumentName = "Default Document Name";
    const defaultOwnerId = "00000000-0000-0000-0000-000000000000";
    const isPrivate = false;

    beforeEach(async () => {
      await roomRepo.createRoomWithDocument(
        defaultRoomId,
        defaultRoomName,
        defaultDocumentName,
        defaultOwnerId,
        isPrivate
      );
    });

    afterEach(async () => {
      await sql!`TRUNCATE room_participant, room, document RESTART IDENTITY CASCADE`;
    });

    it("should not authorize user with no access to private room", async () => {
      const isAuthorized = await participantRepo.userPrivateAccess(defaultRoomId, defaultOwnerId.replace('0', '1'));
      expect(isAuthorized).toBe(false);  
    });
    
    it("should authorize user with access to private room", async () => {
      const userId = defaultOwnerId.replace('0', '1');
      await participantRepo.addUserAccess(defaultRoomId, userId);

      const isAuthorized = await participantRepo.userPrivateAccess(defaultRoomId, userId);
      expect(isAuthorized).toBe(true);  
    });

    it("should not add participant to invalid room", async () => {
      expect(participantRepo.addUserAccess(defaultRoomId.replace('3', '4'), defaultOwnerId)).rejects.toThrow(postgres.PostgresError);
    });
  });
});

describe("Socket.IO Connections", () => {
  let io: SocketIOServer;
  let server: any;
  let clientSocket: ClientSocketType;

  beforeAll((done) => {
    const app = express();
    server = createHttpServer(app);
    io = new SocketIOServer(server);

    io.of("/documents").on("connection", (socket) =>
      documentService.documentSocketRouter(io, socket)
    );

    server.listen(PORT, () => {
      console.log(`Test server started on port ${PORT}`);
      done();
    });
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  afterEach((done) => {
    if (clientSocket.connected) clientSocket.disconnect();
    done();
  });

  test("should connect to the /documents namespace", (done) => {
    const callback = (response: any) => {
      expect(response.status).toBe("SUCCESS");
      done();
    };

    clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, {
      extraHeaders: { "room-id": "55" },
    });
    clientSocket.on("/connection", callback);
  });
});

describe("Socket.IO Documents Namespace", () => {
  let io: SocketIOServer;
  let server: any;
  let clientSocket: ClientSocketType;

  const DEFAULT_ROOM_ID = "55";
  const DEFAULT_ROOM_NAME = "Room 55";
  const DEFAULT_DOCUMENT_NAME = "Document 1";
  const DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000000";
  const DEFAULT_IS_PRIVATE = false;

  beforeAll(async () => {
    const app = express();
    server = createHttpServer(app);
    io = new SocketIOServer(server);

    io.of("/documents").on("connection", (socket) =>
      documentService.documentSocketRouter(io, socket)
    );

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
    clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, {
      extraHeaders: { "room-id": DEFAULT_ROOM_ID },
    });
    clientSocket.on("connect", () => expect(clientSocket.connected).toBe(true));

    await roomRepo.createRoomWithDocument(
      DEFAULT_ROOM_ID,
      DEFAULT_ROOM_NAME,
      DEFAULT_DOCUMENT_NAME,
      DEFAULT_OWNER_ID,
      DEFAULT_IS_PRIVATE
    );
  });

  afterEach(async () => {
    if (clientSocket.connected) clientSocket.disconnect();
    await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
  });

  test("should connect to the /documents namespace", (done) => {
    const callback = (response: any) => {
      expect(response.status).toBe("SUCCESS");
      done();
    };

    clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, {
      extraHeaders: { "room-id": DEFAULT_ROOM_ID },
    });
    clientSocket.on("/connection", callback);
  });

  test("should handle /create event", (done) => {
    const documentData = { documentName: "Test Document" };
    const logSpy = jest.spyOn(logger, "info");

    clientSocket.emit(
      "/create",
      documentData,
      async (response: DocumentResponse) => {
        expect(response.status).toBe("SUCCESS");
        expect(response.code).toBe(200);
        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining("Received event: /create")
        );

        const documemts = await documentRepo.getDocumentsInRoom(
          DEFAULT_ROOM_ID
        );
        expect(documemts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: DEFAULT_DOCUMENT_NAME }),
          ])
        );

        done();
      }
    );
  });

  test("should handle /create event and notify other clients", (done) => {
    const documentData = { documentName: DEFAULT_DOCUMENT_NAME };
    const logSpy = jest.spyOn(logger, "info");

    const clientSocket2 = ClientSocket(`http://localhost:${PORT}/documents`, {
      extraHeaders: { "room-id": DEFAULT_ROOM_ID },
    });

    clientSocket2.on("connect", () => {
      clientSocket.emit(
        "/create",
        documentData,
        async (response: DocumentResponse) => {
          expect(response.status).toBe("SUCCESS");
          expect(response.code).toBe(200);
          expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining("Received event: /create")
          );

          const documents = await documentRepo.getDocumentsInRoom(
            DEFAULT_ROOM_ID
          );
          expect(documents).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ name: DEFAULT_DOCUMENT_NAME }),
            ])
          );
        }
      );

      clientSocket2.on("/document", (message: any) => {
        expect(message).toEqual(
          expect.objectContaining({
            documentName: DEFAULT_DOCUMENT_NAME,
            code: 200,
          })
        );
        done();
      });
    });
  });
});

const PORT2 = 7570;

describe("Socket.IO Documents Rename Functionality", () => {
  let io: SocketIOServer;
  let server: any;
  let clientSocket: ClientSocketType;

  const DEFAULT_ROOM_ID = "55";
  const DEFAULT_ROOM_NAME = "Room 55";
  const DEFAULT_DOCUMENT_NAME = "Document 1";
  const DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000000";
  const DEFAULT_IS_PRIVATE = false;

  let documentId: number;

  beforeAll(async () => {
    const app = express();
    server = createHttpServer(app);
    io = new SocketIOServer(server);

    io.of("/documents").on("connection", (socket) =>
      documentService.documentSocketRouter(io, socket)
    );

    server.listen(PORT2, () => {
      console.log(`Test server started on port ${PORT2}`);
    });
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  beforeEach(async () => {
    clientSocket = ClientSocket(`http://localhost:${PORT2}/documents`, {
      extraHeaders: { "room-id": DEFAULT_ROOM_ID },
    });
    clientSocket.on("connect", () => expect(clientSocket.connected).toBe(true));

    await roomRepo.createRoomWithDocument(
      DEFAULT_ROOM_ID,
      DEFAULT_ROOM_NAME,
      DEFAULT_DOCUMENT_NAME,
      DEFAULT_OWNER_ID,
      DEFAULT_IS_PRIVATE
    );
    const documents = await documentRepo.getDocumentsInRoom(DEFAULT_ROOM_ID);
    const foundDocument = documents.find(
      (doc) => doc.name === DEFAULT_DOCUMENT_NAME
    );

    if (!foundDocument) {
      throw new Error(
        `Document with name "${DEFAULT_DOCUMENT_NAME}" not found in room ${DEFAULT_ROOM_ID}`
      );
    }

    documentId = foundDocument.id;
  });

  afterEach(async () => {
    if (clientSocket.connected) clientSocket.disconnect();
    await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
  });

  test("should rename a document successfully", (done) => {
    const newDocumentName = "Renamed Document";

    clientSocket.emit(
      "/rename",
      { documentId, newDocumentName },
      async (response: DocumentResponse) => {
        console.log(response);
        expect(response.status).toBe("SUCCESS");
        expect(response.code).toBe(200);
        expect(response.documentName).toBe(newDocumentName);

        const updatedDocuments = await documentRepo.getDocumentsInRoom(
          DEFAULT_ROOM_ID
        );
        expect(updatedDocuments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: documentId, name: newDocumentName }),
          ])
        );

        console.log("Expecting document name to be updated in the database");

        done();
      }
    );
  });

  test("should fail to rename a document with an empty name", (done) => {
    clientSocket.emit(
      "/rename",
      { documentId, newDocumentName: "" },
      (response: DocumentResponse) => {
        expect(response.status).toBe("ERROR");
        expect(response.code).toBe(400);
        expect(response.message).toBe("Invalid rename request");
        done();
      }
    );
  });

  test("should fail to rename a document with a missing documentId", (done) => {
    clientSocket.emit(
      "/rename",
      { newDocumentName: "New Name" },
      (response: DocumentResponse) => {
        expect(response.status).toBe("ERROR");
        expect(response.code).toBe(400);
        expect(response.message).toBe("Invalid rename request");
        done();
      }
    );
  });

  test("should notify other clients when a document is renamed", (done) => {
    const newDocumentName = "Updated Name";

    const clientSocket2 = ClientSocket(`http://localhost:${PORT2}/documents`, {
      extraHeaders: { "room-id": DEFAULT_ROOM_ID },
    });

    clientSocket2.on("connect", () => {
      clientSocket.emit(
        "/rename",
        { documentId, newDocumentName },
        (response: DocumentResponse) => {
          expect(response.status).toBe("SUCCESS");
          expect(response.code).toBe(200);
        }
      );

      clientSocket2.on("/document/rename", (message: any) => {
        expect(message).toEqual(
          expect.objectContaining({ documentId, newDocumentName, code: 200 })
        );
        done();
      });
    });
  });
});

describe("Socket.IO Documents Delete Functionality", () => {
  let io: SocketIOServer;
  let server: any;
  let clientSocket: ClientSocketType;

  const DEFAULT_ROOM_ID = "55";
  const DEFAULT_ROOM_NAME = "Room 55";
  const DEFAULT_DOCUMENT_NAME = "Document 1";
  const DEFAULT_OWNER_ID = "00000000-0000-0000-0000-000000000000";
  const DEFAULT_IS_PRIVATE = false;
  let documentId: number;

  beforeAll(async () => {
    const app = express();
    server = createHttpServer(app);
    io = new SocketIOServer(server);

    io.of("/documents").on("connection", (socket) =>
      documentService.documentSocketRouter(io, socket)
    );

    server.listen(PORT2, () => {
      console.log(`Test server started on port ${PORT2}`);
    });
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  beforeEach(async () => {
    clientSocket = ClientSocket(`http://localhost:${PORT2}/documents`, {
      extraHeaders: { "room-id": DEFAULT_ROOM_ID },
    });
    clientSocket.on("connect", () => expect(clientSocket.connected).toBe(true));

    await roomRepo.createRoomWithDocument(
      DEFAULT_ROOM_ID,
      DEFAULT_ROOM_NAME,
      DEFAULT_DOCUMENT_NAME,
      DEFAULT_OWNER_ID,
      DEFAULT_IS_PRIVATE
    );
    const documents = await documentRepo.getDocumentsInRoom(DEFAULT_ROOM_ID);
    const foundDocument = documents.find(
      (doc) => doc.name === DEFAULT_DOCUMENT_NAME
    );

    if (!foundDocument) {
      throw new Error(
        `Document with name "${DEFAULT_DOCUMENT_NAME}" not found in room ${DEFAULT_ROOM_ID}`
      );
    }

    documentId = foundDocument.id;
  });

  afterEach(async () => {
    if (clientSocket.connected) clientSocket.disconnect();
    await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
  });

  test("should delete a document successfully", (done) => {

    clientSocket.emit(
      "/delete",
      { documentId },
      async (response: DocumentResponse) => {
        console.log(response);
        expect(response.status).toBe("SUCCESS");
        expect(response.code).toBe(200);
        expect(response.documentId).toBe(documentId);

        const updatedDocuments = await documentRepo.getDocumentsInRoom(
          DEFAULT_ROOM_ID
        );
        expect(updatedDocuments.length).toEqual(0);

        console.log("Expecting no documents in the room");

        done();
      }
    );
  });

  test("should fail to delete a document with a missing documentId", (done) => {
    clientSocket.emit(
      "/delete",
      {  },
      (response: DocumentResponse) => {
        expect(response.status).toBe("ERROR");
        expect(response.code).toBe(400);
        expect(response.message).toBe("Invalid delete request");
        done();
      }
    );
  });

  test("should notify other clients when a document is deleted", (done) => {
    const clientSocket2 = ClientSocket(`http://localhost:${PORT2}/documents`, {
      extraHeaders: { "room-id": DEFAULT_ROOM_ID },
    });

    clientSocket2.on("connect", () => {
      clientSocket.emit(
        "/delete",
        { documentId },
        (response: DocumentResponse) => {
          expect(response.status).toBe("SUCCESS");
          expect(response.code).toBe(200);
        }
      );

      clientSocket2.on("/document/delete", (message: any) => {
        expect(message).toEqual(
          expect.objectContaining({ documentId, code: 200 })
        );
        done();
      });
    });
  });
});

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

import { firebaseMock } from './__mocks__/firebase.mock.js';
import { userRepoMock } from "./__mocks__/user.repo.mock.js";

jest.mock('../user/user.repo', () => ({
  registerUser: jest.fn((): Promise<void> => Promise.resolve()),
  retrieveDisplayName: jest.fn((): Promise<string> => Promise.resolve("John Doe")),
}));

jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({ user_id: "user123" })),
}));

describe("AuthService with Firebase Mock", () => {
  let authService: AuthService;

  beforeEach(() => {
    // Reset mocks before each test.
    jest.clearAllMocks();
    authService = new AuthService(firebaseMock as any, userRepoMock as any);
  });

  it("should sign up a user and register them", async () => {
    // Use a valid-looking JWT token with three parts.
    const fakeToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJ1c2VyX2lkIjoidXNlcjEyMyIsImlhdCI6MTc0MjQwNDYyM30." +
      "8-rnBuCLyEa885HSed36e8GNX8-roqu3cxLAweSuJhY";
    firebaseMock.signUpWithEmailPassword.mockResolvedValue(fakeToken);
    // (If AuthService uses jwtDecode internally, ensure that it decodes the above token to { user_id: "user123" })

    const token = await authService.signUpWithEmailPassword("John Doe", "john@example.com", "password123");

    expect(token).toBe(fakeToken);
    expect(firebaseMock.signUpWithEmailPassword).toHaveBeenCalledWith("john@example.com", "password123");
    // We expect that after decoding the token, registerUser is called with "user123"
    expect(userRepoMock.registerUser).toHaveBeenCalledWith("user123", "John Doe", "john@example.com");
  });

  it("should log in a user and return the token", async () => {
    const fakeToken = "loginFakeToken";
    firebaseMock.loginWithEmailPassword.mockResolvedValue(fakeToken);

    const token = await authService.loginWithEmailPassword("john@example.com", "password123");

    expect(token).toBe(fakeToken);
    expect(firebaseMock.loginWithEmailPassword).toHaveBeenCalledWith("john@example.com", "password123");
  });

  it("should guest login and return a token", async () => {
    const fakeToken = "guestFakeToken";
    firebaseMock.guestToken.mockResolvedValue(fakeToken);

    const token = await authService.guestLogin();

    expect(token).toBe(fakeToken);
    expect(firebaseMock.guestToken).toHaveBeenCalled();
  });

  it("should verify a valid token", async () => {
    const tokenToVerify = "someValidToken";
    firebaseMock.verifyFirebaseIdToken.mockResolvedValue(true);

    const result = await authService.verifyToken(tokenToVerify);

    expect(result).toBe(true);
    expect(firebaseMock.verifyFirebaseIdToken).toHaveBeenCalledWith(tokenToVerify);
  });

  it("should return false when verifying an empty token", async () => {
    const result = await authService.verifyToken("");
    expect(result).toBe(false);
    expect(firebaseMock.verifyFirebaseIdToken).not.toHaveBeenCalled();
  });

  it("should return the display name for a dummy token", async () => {
    // Pass any dummy token because our stub always returns the same decoded result.
    const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcjEyMyIsImRpc3BsYXlOYW1lIjoieW8gbWFtYSIsImlhdCI6MTc0MjQxNzk5OH0.CHmi0bE2WtF4pGHtFS8xvGX3yZeu7heJzV0wyo9igfk";
    await authService.getDisplayName(validToken);

    expect(userRepoMock.retrieveDisplayName).toHaveBeenCalledWith("user123");
  });
});

describe("RoomRepo Tests", () => {
  let roomRepo: RoomRepo;
  const defaultOwnerId = "00000000-0000-0000-0000-000000000000";

  beforeEach(() => {
    roomRepo = new RoomRepo();
  });

  afterEach(async () => {
    // Clean up the tables after each test.
    await sql`TRUNCATE room, document RESTART IDENTITY CASCADE`;
  });

  it("should return undefined when no room exists", async () => {
    const roomId = await roomRepo.retrieveRoomIdByAccess("NonExistentRoom", false);
    expect(roomId).toBeUndefined();
  });

  it("should return room id when room exists without ownerId provided", async () => {
    const newRoomId = uuidv4();
    // Insert a test room without specifying ownerId in the function call.
    await sql`
      INSERT INTO room (id, name, is_private, owner_id)
      VALUES (${newRoomId}, 'TestRoom', false, ${defaultOwnerId})
    `;
    const retrievedId = await roomRepo.retrieveRoomIdByAccess("TestRoom", false);
    expect(retrievedId).toBe(newRoomId);
  });

  it("should return room id when room exists with ownerId provided", async () => {
    const newRoomId = uuidv4();
    await sql`
      INSERT INTO room (id, name, is_private, owner_id)
      VALUES (${newRoomId}, 'TestRoom2', false, ${defaultOwnerId})
    `;
    const retrievedId = await roomRepo.retrieveRoomIdByAccess("TestRoom2", false, defaultOwnerId);
    expect(retrievedId).toBe(newRoomId);
  });

  it("should update the room's is_private flag", async () => {
    const newRoomId = uuidv4();
    // Insert a test room with is_private initially false.
    await sql`
      INSERT INTO room (id, name, is_private, owner_id)
      VALUES (${newRoomId}, 'TestRoomUpdate', false, ${defaultOwnerId})
    `;
    // Verify the initial value is false.
    let result = await sql`SELECT is_private FROM room WHERE id = ${newRoomId}`;
    expect(result[0].is_private).toBe(false);
  
    // Update the room access to true.
    await roomRepo.updateRoomAccess(newRoomId, true);
  
    // Verify that is_private is now true.
    result = await sql`SELECT is_private FROM room WHERE id = ${newRoomId}`;
    expect(result[0].is_private).toBe(true);
  });
});

describe("Room Service", () => {
  let roomService: RoomService;

  const mockToken = 'test-token';
  const mockRoomId = 'test-room-id';
  const mockUserId = 'test-user-id';
  const mockSignatureSecret = 'secret';

  describe('validate user private access', () => {
    beforeEach(async () => {
      jest.resetAllMocks();
  
      roomService = new RoomService(
        documentRepoMock as any, 
        authServiceMock as any, 
        roomRepoMock as any, 
        participantRepoMock as any, 
        signed.default
      );
    });

    it('should check user access with id from token', async () => {
      authServiceMock.getUserId.mockImplementation((token: string) => mockUserId);
      await roomService.validateUserPrivateAccess(mockToken, mockRoomId);

      expect(authServiceMock.getUserId).toHaveBeenCalledWith(mockToken);
      expect(participantRepoMock.userPrivateAccess).toHaveBeenCalledWith(mockRoomId, mockUserId);
    });

    it('should return the result of roomParticipantRepo.userPrivateAccess', async () => {
      const mockAccessResult = true;
      participantRepoMock.userPrivateAccess.mockResolvedValue(mockAccessResult);

      const result = await roomService.validateUserPrivateAccess(mockToken, mockRoomId);
      expect(result).toEqual(mockAccessResult);

      const mockAccessResult2 = false;
      participantRepoMock.userPrivateAccess.mockResolvedValue(mockAccessResult2);

      const result2 = await roomService.validateUserPrivateAccess(mockToken, mockRoomId);
      expect(result2).toEqual(mockAccessResult2);
    });

    it('should throw auth service errors', async () => {
      const errorMessage = 'Auth service error';
      const logSpy = jest.spyOn(logger, 'error');

      
      authServiceMock.getUserId.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(roomService.validateUserPrivateAccess(mockToken, mockRoomId)).rejects.toThrow('Failed to validate user access to room');
      expect(logSpy).toHaveBeenCalledWith(new Error(errorMessage));
    });

    it('should throw participant repo errors', async () => {
      const errorMessage = 'Repo error';
      const logSpy = jest.spyOn(logger, 'error');

      participantRepoMock.userPrivateAccess.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(roomService.validateUserPrivateAccess(mockToken, mockRoomId)).rejects.toThrow('Failed to validate user access to room');
      expect(logSpy).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });

  describe('room share signatures', () => {
    const signature = signed.default({ secret: mockSignatureSecret });

    beforeEach(async () => {
      jest.resetAllMocks();
  
      roomService = new RoomService(
        documentRepoMock as any, 
        authServiceMock as any, 
        roomRepoMock as any, 
        participantRepoMock as any, 
        () => signature
      );
    });

    it('should process valid signatures', async () => {
      const signSpy = jest.spyOn(signature, 'sign');
      const verifySpy = jest.spyOn(signature, 'verify');

      authServiceMock.getUserId.mockImplementation(() => mockUserId);

      const roomSignature = await roomService.createRoomSignature(mockRoomId);
      expect(signSpy).toHaveBeenCalledWith(mockRoomId);

      await roomService.processRoomSignature(mockToken, mockRoomId, roomSignature);
      expect(verifySpy).toHaveBeenCalledWith(roomSignature);
      expect(participantRepoMock.addUserAccess).toHaveBeenCalledWith(mockRoomId, mockUserId);
    });

    it('should throw error for invalid signatures', async () => {
      const verifySpy = jest.spyOn(signature, 'verify');
      const invalidSignature = 'invalidroomSignature';

      authServiceMock.getUserId.mockImplementation(() => mockUserId);

      expect(roomService.processRoomSignature(mockToken, mockRoomId, invalidSignature)).rejects.toThrow(Error);
      expect(verifySpy).toHaveBeenCalledWith(invalidSignature);
    });
  });
});


