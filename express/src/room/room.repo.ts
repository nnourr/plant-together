import sql from "../database/database.js";

export const createRoomWithDocument = async (roomId: string, roomName: string, documentName: string) => {
  await sql.begin(async sql => {
    // Insert into the room table
    await sql`INSERT INTO room (id, name) VALUES (${roomId}, ${roomName})`;

    // Insert into the document table and link to the room
    await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;
  });
}

export const retrieveRoomId = async (roomName: string, ownerId?: string) => {
  const ownerCondition = ownerId ? ` AND owner_id = ${ownerId};` : '';
  const idRes = await sql`SELECT (id) FROM room WHERE name = ${roomName}`;

  if (!idRes.length) {
    console.error(`Requested room ${roomName} doesn't exist`);
    return undefined;
  }

  return idRes[0].id;
};
