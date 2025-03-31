import { DocumentRepo } from "../document/document.repo.js";
import { AuthService } from "../user/auth.service.js";
import * as RoomRepo from "./room.repo.js";
import { logger } from "../logger.js";
export class RoomService {
  private documentRepo: DocumentRepo;
  private authService: AuthService;
  constructor(documentRepo: DocumentRepo, authService: AuthService) {
    this.documentRepo = documentRepo;
    this.authService = authService;
  }

  async getUML(roomId: string) {
    let content: any = [];
    let room_documents;

    room_documents = (await this.documentRepo.getDocumentsInRoom(roomId))
      .documents;
    for (let document of room_documents) {
      content.push({
        docName: document.name,
        uml: await this.documentRepo.getDocumentUML(roomId, document.id),
      });
    }

    return content;
  }

  async validateRoomCreator(token: string, is_private: boolean)  {
    try{
      const guest = await this.authService.isGuestUser(token!);
      if (guest && is_private) {
        return false;
      }
    }
    catch (error) {
      logger.error(error);
      throw new Error("Error validating room creator");
    }
    return true;
  }

  async validatePublicRoomName(roomName: string) {
    try {
      const roomid = await RoomRepo.retrieveRoomIdByAccess(roomName, false);
      if (!roomid) {
        return true;
      }
      else {
        return false;
      }
    }
    catch (error) {
      logger.error(error);
      throw new Error("Public room name already exists");
    }
  }

  async changeRoomAccess(token: string, roomName: string, isPrivate: boolean) {
    try {
      const ownerId = this.authService.getUserId(token);
      const roomId = await RoomRepo.retrieveRoomId(roomName, ownerId);
      if (roomId) {
      await RoomRepo.updateRoomAccess(roomId, isPrivate);
      }
      else {

        throw new Error("Room not found or not accessible");
      }
    } 
    catch (error) {
      logger.error(error);
      throw new Error("Error updating room access");
    }
  }
}
