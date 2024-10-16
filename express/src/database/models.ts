// models.ts

export interface Room {
  id: number;
  name: string;
}

export interface Document {
  id?: number;  // Auto-generated, so it can be optional
  name: string;
  room_id: number;
}
