import sql from '../database/database.js';

const createDocumentInRoom = async (roomId: string, documentName: string) => {
  try {
    await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;

    console.log(`Document "${documentName}" added to room with ID ${roomId}`);
  } catch (error) {
    console.error('Error adding document to room:', error);
  }
}

const getRoomWithDocuments = async (roomId: string) => {
  try {
    const documents = await sql`
      SELECT id, name
      FROM document
      WHERE room_id = ${roomId}
    `;

    console.info(`Documents in Room ${roomId}:`, documents);
    return { room_id: roomId, documents: documents };
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
}

export const documentRepo = { createDocumentInRoom, getRoomWithDocuments };
