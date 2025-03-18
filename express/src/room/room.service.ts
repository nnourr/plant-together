import { DocumentRepo } from "../document/document.repo.js";

export class RoomService {
  private documentRepo: DocumentRepo;
  constructor(documentRepo: DocumentRepo) {
    this.documentRepo = documentRepo;
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
}
