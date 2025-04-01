import { DocumentRepo } from "../document/document.repo.js";
import { AuthService } from "../user/auth.service.js";
import { RoomRepo } from "./room.repo.js";
import { logger } from "../logger.js";
export class RoomService {
  private documentRepo: DocumentRepo;
  private authService: AuthService;
  private roomRepo: RoomRepo;
  constructor(documentRepo: DocumentRepo, authService: AuthService, roomRepo: RoomRepo) {
    this.roomRepo = roomRepo;
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

  async validateRoomCreator(token: string, is_private: boolean) {
    try {
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
      const roomid = await this.roomRepo.retrieveRoomIdByAccess(roomName, false);
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
      const roomId = await this.roomRepo.retrieveRoomId(roomName, ownerId);
      if (roomId) {
        await this.roomRepo.updateRoomAccess(roomId, isPrivate);
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
