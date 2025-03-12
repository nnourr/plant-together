import sql from "../database/database.js";
import { logger } from "../logger.js";
import { getDoc } from "../yjs/yjs.helpers.js";
import { sqlDocument } from "./document.types.js";

const createDocument = async (roomId: string, documentName: string) => {
  await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;
  const id_res =
    await sql`SELECT id FROM document WHERE room_id = ${roomId} AND name = ${documentName}`;
  logger.info(
    `Document "${documentName}" added to room with ID ${roomId} response ${JSON.stringify(
      id_res
    )}`
  );
  return id_res[0].id;
};

const getDocumentsInRoom = async (roomId: string) => {
  const documents = await sql<sqlDocument[]>`
    SELECT id, name
    FROM document
    WHERE room_id = ${roomId}
  `;

  console.info(`Documents in Room ${roomId}:`, documents);
  return { room_id: roomId, documents: documents };
};

const renameDocument = async (documentId: string, newDocumentName: string) => {
  await sql`UPDATE document SET name = ${newDocumentName} WHERE id = ${documentId}`;
  logger.info(`Document with ID ${documentId} renamed to "${newDocumentName}"`);
  return { documentId, newDocumentName };
};

const getDocumentUML = async (roomId: string, documentId: number) => {
  const doc = await getDoc(roomId + documentId);
  return doc.getText("monaco").toString();
};

export const documentRepo = {
  createDocument,
  getDocumentsInRoom,
  renameDocument,
  getDocumentUML,
};
