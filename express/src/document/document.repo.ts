import sql from '../database/database.js';

const createDocument = async (roomId: string, documentName: string) => {
  await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;
  console.log(`Document "${documentName}" added to room with ID ${roomId}`);
}

const getDocumentsInRoom = async (roomId: string) => {
  const documents = await sql`
    SELECT id, name
    FROM document
    WHERE room_id = ${roomId}
  `;

  console.info(`Documents in Room ${roomId}:`, documents);
  return { room_id: roomId, documents: documents };
}

export const documentRepo = { createDocument, getDocumentsInRoom };
