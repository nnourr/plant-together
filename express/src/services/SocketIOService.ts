import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { logger } from "../logger";
// import { IRoom } from "../models/interfaces";
/**
 * This service mainly takes care of events other than yjs document
 * i.e.
 * 1. participant joining a room
 * 2. client changing the language in the code room
 */
export class SocketIOService {
  io: Server;
  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
      },
    });

    this.io.on("connection", (socket) => {
      logger.info("Connected via socket IO");
      /**
       * Participant add event
       */
      socket.on("participant:add", (data) => {
        logger.info("Participant add " + data);
      });

      /**
       * Language change event
       */
      socket.on("language:change", (data) => {
        socket.broadcast.emit("language:change", data);
      });
    });
  }

  // public emitParticipantJoin(room: IRoom) {
  //     this.io.emit('participant:add', room);
  // }

  // public getSocketServer() : Server {
  //     return this.io;
  // }
}
