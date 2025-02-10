import * as room from "../room/room.repo.js";
import { jest } from "@jest/globals"
import sql from "../database/database.js";

describe('Repositories', () => {
  beforeAll(async () => {
  })

  it('does', () => {
    expect(true).toBe(true)
  })

  describe("Rooms Repository", () => {
    const defaultRoomId = '1'
    const defaultRoomName = 'Room Name Default'
    const defaultDocumentName = 'Default Document Name'

    beforeEach(async () => {
      // each test has at least one room and one document
      await room.createRoomWithDocument(defaultRoomId, defaultRoomName, defaultDocumentName)
    })

    afterEach(async () => {
      // undo actions that occurred with the test
      await sql!`TRUNCATE room, document RESTART IDENTITY CASCADE`;
    })

    afterAll(async () => {
      // Clean up after each test
      await sql.end()
    });

    it('creates room with 1 document', async () => {
      const roomId = '100'
      const roomName = 'Room 100'
      const documentName = 'Document One'

      await room.createRoomWithDocument(roomId, roomName, documentName)
      const roomWithDocuments = await room.getRoomWithDocuments(roomId)

      expect(roomWithDocuments?.room_id).toBe(roomId)
      expect(roomWithDocuments?.documents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: documentName })
        ])
      )
    })

    it('adds 1 document to a room', async () => {
      const documentName = "Document Two"

      await room.createDocumentInRoom(defaultRoomId, documentName)
      const roomWithDocuments = await room.getRoomWithDocuments(defaultRoomId)

      expect(roomWithDocuments?.room_id).toBe(defaultRoomId)
      expect(roomWithDocuments?.documents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: documentName })
        ])
      )
    })

    it('gets documents from a room', async () => {
      const roomWithDocuments = await room.getRoomWithDocuments(defaultRoomId)

      expect(roomWithDocuments?.room_id).toBe(defaultRoomId)
      expect(roomWithDocuments?.documents).toBeInstanceOf(Array)
    })
  })

})
