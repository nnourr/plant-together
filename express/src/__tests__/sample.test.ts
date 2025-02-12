import * as room from "../room/room.repo.js";
import { jest } from "@jest/globals"
import sql from "../database/database.js";

describe('Repositories', () => {
  beforeAll(async () => {
  })

  it('does', () => {
    expect(true).toBe(true)
  })

  describe("Rooms Repository", () => {
    const defaultRoomId = '1'
    const defaultRoomName = 'Room Name Default'
    const defaultDocumentName = 'Default Document Name'

    beforeEach(async () => {
      // each test has at least one room and one document
      await room.createRoomWithDocument(defaultRoomId, defaultRoomName, defaultDocumentName)
    })

    afterEach(async () => {
      // undo actions that occurred with the test
      await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
    })

    it('creates room with 1 document', async () => {
      const roomId = '100'
      const roomName = 'Room 100'
      const documentName = 'Document One'

      await room.createRoomWithDocument(roomId, roomName, documentName)
      const roomWithDocuments = await documentRepo.getDocumentsInRoom(roomId)

      expect(roomWithDocuments?.room_id).toBe(roomId)
      expect(roomWithDocuments?.documents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: documentName })
        ])
      )
    })

    it('adds 1 document to a room', async () => {
      const documentName = "Document Two"

      await documentRepo.createDocument(defaultRoomId, documentName)
      const roomWithDocuments = await documentRepo.getDocumentsInRoom(defaultRoomId)

      expect(roomWithDocuments?.room_id).toBe(defaultRoomId)
      expect(roomWithDocuments?.documents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: documentName })
        ])
      )
    })

    it('gets documents from a room', async () => {
      const roomWithDocuments = await documentRepo.getDocumentsInRoom(defaultRoomId)

      expect(roomWithDocuments?.room_id).toBe(defaultRoomId)
      expect(roomWithDocuments?.documents).toBeInstanceOf(Array)
    })
  })

})


import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';

import express from 'express';

import { documentSocketRouter } from '../document/document.service.js';
import { logger } from '../logger.js';
import { DocumentResponse } from '../document/document.types.js';
import { documentRepo } from '../document/document.repo.js';
import { createRoomWithDocument } from '../room/room.repo.js';

const PORT = 7565;

describe('Socket.IO Connections', () => {
  let io: SocketIOServer;
  let server: any;
  let clientSocket: ClientSocketType;

  beforeAll((done) => {
    const app = express();
    server = createHttpServer(app);
    io = new SocketIOServer(server);

    io.of('/documents').on('connection', (socket) => documentSocketRouter(io, socket));

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

  test('should connect to the /documents namespace', (done) => {
    const callback = (response: any) => {
      expect(response.status).toBe('SUCCESS');
      done();
    };

    clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, { extraHeaders: { room_id: '55' } });
    clientSocket.on('/connection', callback);
  });
});

describe('Socket.IO Documents Namespace', () => {
  let io: SocketIOServer;
  let server: any;
  let clientSocket: ClientSocketType;

  const DEFAULT_ROOM_ID = '55';
  const DEFAULT_ROOM_NAME = 'Room 55';
  const DEFAULT_DOCUMENT_NAME = 'Document 1';

  beforeAll(async () => {
    const app = express();
    server = createHttpServer(app);
    io = new SocketIOServer(server);

    io.of('/documents').on('connection', (socket) => documentSocketRouter(io, socket));

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
    clientSocket.on('connect', () => expect(clientSocket.connected).toBe(true));

    await createRoomWithDocument(DEFAULT_ROOM_ID, DEFAULT_ROOM_NAME, DEFAULT_DOCUMENT_NAME);
  });

  afterEach(async () => {
    if (clientSocket.connected) clientSocket.disconnect();
    await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
  });

  test('should connect to the /documents namespace', (done) => {
    const callback = (response: any) => {
      expect(response.status).toBe('SUCCESS');
      done();
    };

    clientSocket = ClientSocket(`http://localhost:${PORT}/documents`, { extraHeaders: { room_id: DEFAULT_ROOM_ID } });
    clientSocket.on('/connection', callback);
  });

  test('should handle /create event', (done) => {
    const documentData = { documentName: 'Test Document' };
    const logSpy = jest.spyOn(logger, 'info');

    clientSocket.emit('/create', documentData, async (response: DocumentResponse) => {
      expect(response.status).toBe('SUCCESS');
      expect(response.code).toBe(200);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Received event: /create'));

      const documemts = await documentRepo.getDocumentsInRoom(DEFAULT_ROOM_ID);
      expect(documemts?.documents).toEqual(expect.arrayContaining([expect.objectContaining({ name: DEFAULT_DOCUMENT_NAME })]));

      done();
    });
  });

  test('should handle /create event and notify other clients', (done) => {
    const documentData = { documentName: DEFAULT_DOCUMENT_NAME };
    const logSpy = jest.spyOn(logger, 'info');

    const clientSocket2 = ClientSocket(`http://localhost:${PORT}/documents`, { extraHeaders: { room_id: DEFAULT_ROOM_ID } });

    clientSocket2.on('connect', () => {
      clientSocket.emit('/create', documentData, async (response: DocumentResponse) => {
        expect(response.status).toBe('SUCCESS');
        expect(response.code).toBe(200);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Received event: /create'));

        const documents = await documentRepo.getDocumentsInRoom(DEFAULT_ROOM_ID);
        expect(documents?.documents).toEqual(expect.arrayContaining([expect.objectContaining({ name: DEFAULT_DOCUMENT_NAME })]));
      });

      clientSocket2.on('/document', (message: any) => {
        expect(message).toEqual(expect.objectContaining({ documentName: DEFAULT_DOCUMENT_NAME, code: 200 }));
        done();
      });
    });
  });
});
