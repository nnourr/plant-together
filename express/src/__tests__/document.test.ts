import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';

import express from 'express';

import { documentSocketIO } from '../document/document-service.js';
import { logger } from '../logger.js';
import { DocumentResponse } from '../document/document-types.js';
import { documentRepo } from '../document/document.repo.js';

const PORT = 7565;

describe('Socket.IO Documents Namespace', () => {
    let io: SocketIOServer;
    let server: any;
    let clientSocket: ClientSocketType;

    beforeAll((done) => {
        const app = express();
        server = createHttpServer(app);
        io = new SocketIOServer(server);

        io.of('/').on('connection', (socket) => logger.info(`New root namespace socket connection ${socket.id}`));
        io.of('/documents').on('connection', (socket) => documentSocketIO(io, socket, documentRepo));

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

    beforeEach((done) => {
        clientSocket = ClientSocket(`http://localhost:${PORT}/documents`);
        clientSocket.on('connect', done);
    });

    afterEach((done) => {
        if (clientSocket.connected) clientSocket.disconnect();
        done();
    });

    test('should connect to the /documents namespace', (done) => {
        clientSocket.on('/connection', (response) => {
            expect(response.status).toBe('SUCCESS');
            done();
        });
    });

    test('should handle /create event', (done) => {
        const documentData = { documentName: 'Test Document' };

        clientSocket.emit('/create', documentData, async (response: DocumentResponse) => {
            expect(response.status).toBe('SUCCESS');
            expect(response.code).toBe(200);
            done();
        });
    });

    test('should log events', (done) => {
        const logSpy = jest.spyOn(logger, 'info');
        const documentData = { documentName: 'Test Document' };

        clientSocket.emit('/create', documentData, (response: DocumentResponse) => {
            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Received event: /create'));
            done();
        });
    });
});