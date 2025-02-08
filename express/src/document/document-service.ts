import { Socket, Server as SocketIOServer } from "socket.io";
import { documentRepo } from "./document.repo.js";
import { logger } from "../logger.js";

export const documentSocketIO = (io: SocketIOServer, socket: Socket) => {
    logger.info(`New document socket connection ${socket.id}`);
    socket.emit("/connection", { status: 'SUCCESS' });

    socket.onAny((event, ...args) => {
        logger.info(`${socket.nsp.name}: Received event: ${event} with data: ${JSON.stringify(args)}`);
    });

    socket.on('/create', async (data) => {
        logger.info(`${socket.nsp.name}: Received create event with data: ${JSON.stringify(data)}`);

        const { room_id, document_name } = data;

        await documentRepo.createDocumentInRoom(room_id, document_name);
        io.of('/documents').emit("/document", { status: 'SUCCESS', room_id, document_name });
    });

    socket.on("disconnect", () => {
        logger.info(`Socket ${socket.id} disconnected`);
    });
}
