const serverHttpUrl = import.meta.env.VITE_SERVER_HTTP_URL;


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
export const createDocumentInRoom = async (roomId: string, documentName: string) => {
  const response = await fetch(`${serverHttpUrl}/room/${roomId}/document/${documentName}`, {
    method:"POST",
  })

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }
}
export const getRoomWithDocuments = async (roomId: string) => {
  const response = await fetch(`${serverHttpUrl}/room/${roomId}`)
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }

  const room = await response.json()
  return room
}
  