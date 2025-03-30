import { Socket } from "socket.io-client";
import { parseToken } from "../utils/auth.helpers";

const serverHttpUrl = (import.meta.env.VITE_SERVER_HTTP_URL || "http://localhost:3000");

export const createRoomWithDocument = async (roomId: string, roomName: string, documentName: string) => {
  const response = await fetch(`${serverHttpUrl}/room/${roomId}`, {
    body: JSON.stringify({
      room_name: roomName,
      document_name: documentName
    }),
    method:"POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${await retrieveToken()}`
    },
  })
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }
}

export const createDocumentInRoom = (
  socket: Socket,
  documentName: string,
  callback: (response: any) => void
) => {
  socket.emit(
    "/create", 
    {documentName: documentName},
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

export const updateDocumentInRoom = (
  socket: Socket,
  documentId: string,
  newDocumentName: string,
  callback: (response: any) => void
) => {
  socket.emit(
    "/rename", 
    {documentId: documentId, newDocumentName: newDocumentName},
    (response: any) => {
      if (response.status === "SUCCESS") {
        console.log("Document renamed successfully!");
      } else {
        console.error(`Failed to rename document: ${response.message}`);
      }

      if (callback) callback(response);
    }
  );
};

export const deleteDocumentInRoom = (
  socket: Socket,
  documentId: string,
  callback: (response: any) => void
) => {
  socket.emit(
    "/delete", 
    {documentId: documentId},
    (response: any) => {
      if (response.status === "SUCCESS") {
        console.log("Document deleted successfully!");
      } else {
        console.error(`Failed to delete document: ${response.message}`);
      }

      if (callback) callback(response);
    }
  );
};

export const getRoomWithDocuments = async (roomId: string) => {
  const response = await fetch(`${serverHttpUrl}/room/${roomId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${await retrieveToken()}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }

  const room = await response.json()
  return room
}

export const loginWithEmailPassword = async (email: string, password: string) => {
  const response = await fetch(`${serverHttpUrl}/auth/login`, {
    body: JSON.stringify({ email, password }),
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = await response.json();

  if (!response.ok) throw new Error(body.error || '');

  return body;
}

export const loginGuest = async () => {
  const response = await fetch(`${serverHttpUrl}/auth/guest`, {
    method:"GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = await response.json();

  if (!response.ok) throw new Error(body.error || '');

  return body;
}

export const signupWithEmailPassword = async (displayName: string, email: string, password: string) => {
  const response = await fetch(`${serverHttpUrl}/auth/signup`, {
    body: JSON.stringify({ displayName, email, password }),
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = await response.json();

  if (!response.ok) throw new Error(body.error);

  return body;
}

export const retrieveDisplayName = async (token: string = '') => {
  const response = await fetch(`${serverHttpUrl}/user/displayName`, {
    method:"GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token || await retrieveToken()}`
    },
  });

  const body = await response.json();

  if (!response.ok) throw new Error(body.error);

  return body;
}

const refreshToken = async (token: string | null) => {
  if (!token) throw new Error("Failed to refresh user session. Provided token is empty");

  // TODO: Request new token using refresh token HTTP-Only Cookie & update session storage
  throw new Error("Failed to refresh user session");
};

export const retrieveToken = async (loginGuestUserCallback?: (...args: any[]) => Promise<void> | undefined, ...args: any[]) => {
  let token = window.sessionStorage.getItem("jwt") as string;
  
  if (!token) {
    if (!loginGuestUserCallback) throw new Error("User session was not properly initialized");
    
    await loginGuestUserCallback(...args);
    token = window.sessionStorage.getItem("jwt") as string;

    console.log('Guest user login success');
  }
  
  const tokenContext = parseToken(token);
  const { expiry } = tokenContext;

  if (!expiry || expiry < Date.now() / 1000) token = await refreshToken(token);

  return token;
};

export async function getRoomUML(roomId: string): Promise<{docName: string, uml: string}[]> {
  const response = await fetch(`${serverHttpUrl}/room/${roomId}/uml`, 
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${await retrieveToken()}`
      }
    }
  );
  if (!response.ok) throw new Error('Failed to fetch UML content');
  return response.json();
}

