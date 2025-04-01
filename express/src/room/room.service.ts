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

    room_documents = (await this.documentRepo.getDocumentsInRoom(roomId));
    for (let document of room_documents) {
      content.push({
        docName: document.name,
        uml: await this.documentRepo.getDocumentUML(roomId, document.id),
      });
    }
    return content;
  }

  async validateRoomCreator(token: string, room_id: string) {
    try {
      const guest = await this.authService.isGuestUser(token!);
      if (guest) {
        return false;
      }
      const room = await this.roomRepo.getRoomById(room_id);
      if (!room) {
        return false;
      }
      const ownerId = this.authService.getUserId(token!);
      if (room.owner_id !== ownerId) {
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

  async changeRoomAccess(room_id: string, isPrivate: boolean) {
    try {
      await this.roomRepo.updateRoomAccess(room_id, isPrivate);
    }
    catch (error) {
      logger.error(error);
      throw new Error("Error updating room access");
    }
  }
}
