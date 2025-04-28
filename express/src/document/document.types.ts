export interface DocumentData {
  documentName: string
}

export interface DocumentResponse {
  status: string
  code: number
  message?: string
  roomId?: string
  documentName?: string
  documentId?: string
  newDocumentName?: string
}

export type DocumentCallback = (response: DocumentResponse) => any

export interface RenameDocumentData {
  documentId: string
  newDocumentName: string
}

export interface DeleteDocumentData {
  documentId: string
}
