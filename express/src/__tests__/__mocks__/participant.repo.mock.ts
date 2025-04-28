import { jest } from '@jest/globals'

export const participantRepoMock = {
    userPrivateAccess:
        jest.fn<(roomId: string, userId: string) => Promise<boolean>>(),
    addUserAccess: jest.fn<(roomId: string, userId: string) => Promise<void>>(),
}
