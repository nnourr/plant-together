import { Sql } from "postgres";

export class RoomParticipantRepo{
  private sql: Sql;
  
  constructor(sql: Sql) {
    this.sql = sql;
  }

  async userPrivateAccess(roomId: string, userId: string) : Promise<boolean> {
    if (!userId || !roomId) return false;
    
    const records = await this.sql`SELECT * FROM room_participant WHERE room_id = ${roomId} AND user_id = ${userId}`;
    return records && records.length > 0;
  }
}

