import { DocumentRepo } from "../document/document.repo.js";
import { AuthService } from "../user/auth.service.js";
import { RoomRepo } from "./room.repo.js";
import { logger } from "../logger.js";
import { RoomParticipantRepo } from "./participant.repo.js";
import { Signature, SignatureOptions } from "signed";
import { ROOM_SIGNATURE_SECRET } from "../config.js";

export class RoomService {
  private documentRepo: DocumentRepo;
  private authService: AuthService;
  private roomRepo: RoomRepo;
  private roomParticipantRepo: RoomParticipantRepo;
  private signature: Signature;

  constructor(documentRepo: DocumentRepo, authService: AuthService, roomRepo: RoomRepo, 
    roomParticipantRepo: RoomParticipantRepo, signed: (options: SignatureOptions) => Signature) 
  {
    this.roomRepo = roomRepo;
    this.documentRepo = documentRepo;
    this.authService = authService;
    this.roomParticipantRepo = roomParticipantRepo;
    this.signature = signed({ secret: ROOM_SIGNATURE_SECRET! });
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

  async validateUserPrivateAccess(token: string, roomId: string) {
    try {      
      const userId = this.authService.getUserId(token);
      return await this.roomParticipantRepo.userPrivateAccess(roomId, userId);
    } catch (error: any) {
      logger.error(error);
      throw new Error("Failed to validate user access to room");
    }
  }

  async createRoomSignature(roomId: string) {
    try {
      if (!roomId) throw new Error("Room not found or not accessible");  
      return this.signature.sign(roomId);
    } catch (error: any) {
      logger.error(error);
      throw new Error("Failed to sign room url");
    }
  }

  async processRoomSignature(token: string, roomId: string, signature: string) {
    try {
      if (!roomId) throw new Error("No room provided");

      const userId = this.authService.getUserId(token);
      const verifiedRoomId = this.signature.verify(signature);

      if (verifiedRoomId !== roomId) throw new Error("Provided signature doesn't match requested room");
      
      this.roomParticipantRepo.addUserAccess(verifiedRoomId, userId);
    } catch (error: any) {
      logger.error(error);
      throw new Error("Failed to sign room url");
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
