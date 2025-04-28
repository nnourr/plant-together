import sql from '../database/database.js'
import { Room } from '../database/models.js'

export class RoomRepo {
    constructor() {}

    async getRoomById(roomId: string) {
        const room = await sql<Room[]>`SELECT * FROM room WHERE id = ${roomId}`
        if (!room || !room.length) {
            console.error(`Room with ID ${roomId} not found`)
            return undefined
        }
        return room[0]
    }

    async createRoomWithDocument(
        roomId: string,
        roomName: string,
        documentName: string,
        ownerId: string,
        isPrivate: boolean,
    ) {
        await sql.begin(async sql => {
            // Insert into the room table
            await sql`INSERT INTO room (id, name, owner_id, is_private) VALUES (${roomId}, ${roomName}, ${ownerId}, ${isPrivate})`

            // Insert into the document table and link to the room
            await sql`INSERT INTO document (name, room_id) VALUES (${documentName}, ${roomId})`
        })
    }

    async retrieveRoomId(roomName: string, ownerId?: string) {
        let idRes

        if (!ownerId)
            idRes =
                await sql`SELECT (id) FROM room WHERE name = ${roomName} AND is_private = false;`
        else
            idRes =
                await sql`SELECT (id) FROM room WHERE name = ${roomName} AND owner_id = ${ownerId}`

        if (!idRes || !idRes.length) {
            console.error(`Requested room ${roomName} doesn't exist`)
            return undefined
        }

        return idRes[0].id
    }

    async retrieveRoomIdByAccess(
        roomName: string,
        isPrivate: boolean = false,
        ownerId?: string,
    ) {
        let idRes

        if (!ownerId)
            idRes =
                await sql`SELECT (id) FROM room WHERE name = ${roomName} AND is_private = ${isPrivate};`
        else
            idRes =
                await sql`SELECT (id) FROM room WHERE name = ${roomName} AND owner_id = ${ownerId} AND is_private = ${isPrivate};`

        if (!idRes || !idRes.length) {
            console.error(`Requested room ${roomName} doesn't exist`)
            return undefined
        }

        return idRes[0].id
    }

    async updateRoomAccess(roomId: string, isPrivate: boolean) {
        await sql`UPDATE room SET is_private = ${isPrivate} WHERE id = ${roomId}`
    }
}
