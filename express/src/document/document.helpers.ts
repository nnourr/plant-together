import {
  DocumentData,
  DocumentCallback,
  DocumentResponse,
} from './document.types.js'
import { Socket } from 'socket.io'

export const validateDocumentData = (
  data: DocumentData,
  callback: DocumentCallback,
) => {
  if (!data) {
    callback({
      status: 'ERROR',
      code: 400,
      message: 'Invalid data',
    } as DocumentResponse)
    return false
  }

  const { documentName } = data

  if (documentName === undefined) {
    callback({
      status: 'ERROR',
      code: 400,
      message: 'Invalid document name',
    } as DocumentResponse)
    return false
  }

  return true
}

export const notifyClientsDocChange = (
  socket: Socket,
  roomId: string,
  documentName: string,
  id: string,
) => {
  socket.broadcast.to(roomId).emit('/document', {
    status: 'SUCCESS',
    code: 200,
    documentName,
    id,
  } as DocumentResponse)
}

export const notifyClientsDocRename = (
  socket: Socket,
  roomId: string,
  documentId: string,
  newDocumentName: string,
) => {
  socket.broadcast.to(roomId).emit('/document/rename', {
    status: 'SUCCESS',
    code: 200,
    documentId,
    newDocumentName,
  } as DocumentResponse)
}

export const notifyClientsDocDelete = (
  socket: Socket,
  roomId: string,
  documentId: string,
) => {
  socket.broadcast.to(roomId).emit('/document/delete', {
    status: 'SUCCESS',
    code: 200,
    documentId,
  } as DocumentResponse)
}
