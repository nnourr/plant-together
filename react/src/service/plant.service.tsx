import { io, Socket } from "socket.io-client";

const serverHttpUrl = "https://fcab-2607-f2c0-e6fd-fae0-5c70-a205-cf03-1cf7.ngrok-free.app";

export const createRoomWithDocument = async (roomId: string, roomName: string, documentName: string) => {
  const response = await fetch(`${serverHttpUrl}/room/${roomId}`, {
    body: JSON.stringify({
      room_name: roomName,
      document_name: documentName
    }),
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }
}

export const createDocumentInRoom = (
  socket: Socket,
  roomId: string,
  documentName: string,
  callback: (response: any) => void
) => {
  socket.emit(
    "/documents/create", 
    { roomId, documentName },
    (response: any) => {
      if (response.status === "SUCCESS") {
        console.log("Document created successfully!");
      } else {
        console.error(`Failed to create document: ${response.message}`);
      }

      if (callback) callback(response);
    }
  );
};

export const getRoomWithDocuments = async (roomId: string) => {
  const response = await fetch(`${serverHttpUrl}/room/${roomId}`)
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }

  const room = await response.json()
  return room
}

