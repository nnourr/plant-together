import { RedisClientType } from "redis";
import { logger } from "../logger.js";
import { getDoc } from "../yjs/yjs.helpers.js";
import { Sql } from "postgres";
import { Document } from "../database/models.js";

export class DocumentRepo {
  private sql;
  private redis;
  constructor(sql: Sql, redis: RedisClientType) {
    this.sql = sql;
    this.redis = redis;
  }

  createDocument = async (roomId: string, documentName: string) => {
    await this
      .sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;
    const id_res = await this
      .sql`SELECT id FROM document WHERE room_id = ${roomId} AND name = ${documentName}`;
    logger.info(
      `Document "${documentName}" added to room with ID ${roomId} response ${JSON.stringify(
        id_res
      )}`
    );
    return id_res[0].id;
  };

  getDocumentsInRoom = async (roomId: string) => {
    const documents = await this.sql<Required<Pick<Document, "id" | "name">>[]>`
      SELECT id, name
      FROM document
      WHERE room_id = ${roomId}
    `;

    console.info(`Documents in Room ${roomId}:`, documents);
    return { room_id: roomId, documents: documents };
  };

  renameDocument = async (documentId: string, newDocumentName: string) => {
    await this
      .sql`UPDATE document SET name = ${newDocumentName} WHERE id = ${documentId}`;
    logger.info(
      `Document with ID ${documentId} renamed to "${newDocumentName}"`
    );
    return { documentId, newDocumentName };
  };

  getDocumentUML = async (roomId: string, documentId: number) => {
    const doc = await getDoc(roomId + documentId, this.redis);
    return doc.getText("monaco").toString();
  };
}
