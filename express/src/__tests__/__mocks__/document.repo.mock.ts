import { jest } from '@jest/globals'
import { Document } from '../../database/models.js'

export const documentRepoMock = {
  createDocument:
    jest.fn<(roomId: string, documentName: string) => Promise<any>>(),
  getDocumentsInRoom:
    jest.fn<
      (roomId: string) => Promise<Required<Pick<Document, 'id' | 'name'>>[]>
    >(),
  renameDocument:
    jest.fn<
      (
        documentId: string,
        newDocumentName: string,
      ) => Promise<{ documentId: string; newDocumentName: string }>
    >(),
  getDocumentUML:
    jest.fn<(roomId: string, documentId: number) => Promise<string>>(),
}
