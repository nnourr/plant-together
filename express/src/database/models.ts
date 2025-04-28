export interface Room {
  id: number
  name: string
  is_private: boolean
  owner_id: string
}

export interface Document {
  id?: number // Auto-generated, so it can be optional
  name: string
  room_id: number
}

export interface RoomParticipants {
  room_id: number
  user_id: number
}
