import { io, Socket } from "socket.io-client";

export const createRoomWithDocument = (
  socket: Socket,
  roomId: string,
  roomName: string,
  documentName: string,
  callback: (response: any) => void
) => {
  socket.emit(
    "createRoom",
    { roomId, roomName, documentName }, 
    (response: any) => {
      if (response.status === "SUCCESS") {
        console.log("Room and document created successfully!");
      } else {
        console.error(`Failed to create room: ${response.message}`);
      }

      if (callback) callback(response);
    }
  );
};

export const createDocumentInRoom = (
  socket: Socket,
  roomId: string,
  documentName: string,
  callback: (response: any) => void
) => {
  socket.emit(
    "createDocument", 
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

export const getRoomWithDocuments = (
  socket: Socket,
  roomId: string,
  callback: (response: any) => void
) => {
  socket.emit(
    "getDocuments", 
    { roomId }, 
    (response: any) => {
      if (response.status === "SUCCESS") {
        console.log("Documents fetched successfully:", response.data);
      } else {
        console.error(`Failed to fetch documents: ${response.message}`);
      }

      if (callback) callback(response);
    }
  );
};
