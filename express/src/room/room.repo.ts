import sql from "../database/database.js";

export const createRoomWithDocument = async (roomId: string, roomName: string, documentName: string) => {
  try {
    await sql.begin(async sql => {
      // Insert into the room table
      await sql`INSERT INTO room (id, name) VALUES (${roomId}, ${roomName})`;

      // Insert into the document table and link to the room
      await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;
    });

    console.log(`Room ${roomName} (ID: ${roomId}) created with document: ${documentName}`);
  } catch (error) {
    console.error('Error creating room with document:', error);
  }
}

export const createDocumentInRoom = async (roomId: string, documentName: string) => {
  try {
    await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;

    console.log(`Document "${documentName}" added to room with ID ${roomId}`);
  } catch (error) {
    console.error('Error adding document to room:', error);
  }
}

export const getRoomWithDocuments = async (roomId: string) => {
  try {
    const documents = await sql`
      SELECT id, name
      FROM document
      WHERE room_id = ${roomId}
    `;

    console.info(`Documents in Room ${roomId}:`, documents);
    return {room_id: roomId, documents: documents};
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
}
