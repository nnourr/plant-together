import sql from "../database/database.js";

export const createRoomWithDocument = async (roomId: string, roomName: string, documentName: string, ownerId: string) => {
  await sql.begin(async sql => {
    // Insert into the room table
    await sql`INSERT INTO room (id, name, owner_id) VALUES (${roomId}, ${roomName}, ${ownerId})`;

    // Insert into the document table and link to the room
    await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`;
  });
}

export const retrieveRoomId = async (roomName: string, ownerId?: string) => {  
  let idRes;

  if (!ownerId) idRes = await sql`SELECT (id) FROM room WHERE name = ${roomName};`;
  else idRes = await sql`SELECT (id) FROM room WHERE name = ${roomName} AND owner_id = ${ownerId};`;

  if (!idRes || !idRes.length) {
    console.error(`Requested room ${roomName} doesn't exist`);
    return undefined;
  }

  return idRes[0].id;
};
