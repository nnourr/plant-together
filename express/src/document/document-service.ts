import { Socket, Server as SocketIOServer } from "socket.io";
import { documentRepo } from "./document.repo.js";
import { logger } from "../logger.js";

import { DocumentData, DocumentCallback, DocumentResponse } from './document-types.js';
import { validateDocumentData, notifyClientsDocChange } from './document-helpers.js';

const onConnect = (socket: Socket) => {
    const roomId: string = socket.handshake.headers?.room_id as string;

    if (!roomId) {
        const errorMessage: string = 'Room ID not provided';
        socket.emit("/connection", { status: 'ERROR', code: 400, message: errorMessage });

        socket.disconnect();
        throw new Error(errorMessage);
    }

    logger.info(`Socket ${socket.id} joining room ${roomId}`);
    socket.join(roomId);

    socket.emit("/connection", { status: 'SUCCESS' });
    return roomId;
}

const createEventHandler = async (socket: Socket, data: DocumentData, callback: DocumentCallback) => {
    if (typeof callback !== 'function') callback = (response: DocumentResponse) => logger.info(JSON.stringify(response));
    if (!validateDocumentData(data, callback)) return;

    const { documentName } = data;
    const roomId = socket.handshake.headers?.room_id as string;

    try {
        await documentRepo.createDocumentInRoom(roomId, documentName);
    } catch (error) {
        logger.error(`Error creating document: ${error}`);
        callback({ status: 'ERROR', code: 500, message: 'Internal server error' } as DocumentResponse);

        return;
    }

    notifyClientsDocChange(socket, roomId, documentName);
    callback({ status: 'SUCCESS', code: 200 } as DocumentResponse);
}

export const documentSocketIO = (io: SocketIOServer, socket: Socket) => {
    logger.info(`New document socket connection ${socket.id}`);

    let roomId: string;

    try {
        roomId = onConnect(socket);
    } catch (error) {
        logger.error(`Error connecting socket ${socket.id}: ${error}`);
        return;
    }

    socket.onAny((event, ...args) => {
        logger.info(`${socket.nsp.name}: Received event: ${event} with data: ${JSON.stringify(args)}`);
    });

    socket.on('/create', async (data: DocumentData, callback: DocumentCallback) => {
        logger.info(`${socket.nsp.name}: Received create event with data: ${JSON.stringify(data)}`);
        createEventHandler(socket, data, callback);
    });

    socket.on("disconnect", () => {
        logger.info(`Socket ${socket.id} disconnected`);
    });
}
