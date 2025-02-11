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
