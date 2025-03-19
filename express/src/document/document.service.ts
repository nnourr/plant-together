import { Socket, Server as SocketIOServer } from "socket.io";
import { logger } from "../logger.js";

import {
  DocumentData,
  DocumentCallback,
  DocumentResponse,
  RenameDocumentData,
} from "./document.types.js";
import {
  validateDocumentData,
  notifyClientsDocChange,
  notifyClientsDocRename,
} from "./document.helpers.js";
import { DocumentRepo } from "./document.repo.js";

export class DocumentService {
  private documentRepo: DocumentRepo;
  constructor(documentRepo: DocumentRepo) {
    this.documentRepo = documentRepo;
  }

  documentSocketRouter = (io: SocketIOServer, socket: Socket) => {
    logger.info(`New document socket connection ${socket.id}`);

    let roomId: string;

    try {
      roomId = this.onConnect(socket);
    } catch (error) {
      logger.error(`Error connecting socket ${socket.id}: ${error}`);
      return;
    }

    socket.onAny((event, ...args) => {
      logger.info(
        `${
          socket.nsp.name
        }: Received event: ${event} with data: ${JSON.stringify(args)}`
      );
    });

    socket.on(
      "/create",
      async (data: DocumentData, callback: DocumentCallback) => {
        logger.info(
          `${
            socket.nsp.name
          }: Received create event with data: ${JSON.stringify(data)}`
        );
        this.createEventHandler(socket, data, callback);
      }
    );

    socket.on(
      "/rename",
      async (data: RenameDocumentData, callback: DocumentCallback) => {
        logger.info(
          `${
            socket.nsp.name
          }: Received rename event with data: ${JSON.stringify(data)}`
        );
        this.renameEventHandler(socket, data, callback);
      }
    );

    socket.on("disconnect", () => {
      logger.info(`Socket ${socket.id} disconnected`);
    });
  };
  private onConnect = (socket: Socket) => {
    const roomId: string = socket.handshake.headers?.["room-id"] as string;

    if (!roomId) {
      const errorMessage: string = "Room ID not provided";
      socket.emit("/connection", {
        status: "ERROR",
        code: 400,
        message: errorMessage,
      });

      socket.disconnect();
      throw new Error(errorMessage);
    }

    logger.info(`Socket ${socket.id} joining room ${roomId}`);
    socket.join(roomId);

    socket.emit("/connection", { status: "SUCCESS" });
    return roomId;
  };

  private createEventHandler = async (
    socket: Socket,
    data: DocumentData,
    callback: DocumentCallback
  ) => {
    if (typeof callback !== "function")
      callback = (response: DocumentResponse) => {};
    if (!validateDocumentData(data, callback)) return;
    let id;
    const { documentName } = data;
    const roomId = socket.handshake.headers?.["room-id"] as string;
    try {
      id = await this.documentRepo.createDocument(roomId, documentName);
    } catch (error) {
      logger.error(`Error creating document: ${error}`);
      callback({
        status: "ERROR",
        code: 500,
        message: "Internal server error",
      } as DocumentResponse);

      return;
    }

    notifyClientsDocChange(socket, roomId, documentName, id);
    callback({ status: "SUCCESS", code: 200, id: id } as DocumentResponse);
  };

  private renameEventHandler = async (
    socket: Socket,
    data: RenameDocumentData,
    callback: DocumentCallback
  ) => {
    if (typeof callback !== "function")
      callback = (response: DocumentResponse) => {};

    const { documentId, newDocumentName } = data;
    const roomId = socket.handshake.headers?.["room-id"] as string;

    if (!documentId || !newDocumentName) {
      callback({
        status: "ERROR",
        code: 400,
        message: "Invalid rename request",
      });
      return;
    }

    try {
      await this.documentRepo.renameDocument(documentId, newDocumentName);
    } catch (error) {
      logger.error(`Error renaming document: ${error}`);
      callback({
        status: "ERROR",
        code: 500,
        message: "Internal server error",
      });
      return;
    }

    notifyClientsDocRename(socket, roomId, documentId, newDocumentName);
    logger.info(`Clients in ${roomId} notified of rename of ducumentID: ${documentId} to name: ${newDocumentName}`);
    callback({ status: "SUCCESS", code: 200, documentName: newDocumentName });
  };
}
