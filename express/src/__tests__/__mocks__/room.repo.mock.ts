import { jest } from '@jest/globals'

export const roomRepoMock = {
    createRoomWithDocument: jest.fn<() => Promise<void>>(),
    retrieveRoomId:
        jest.fn<(_: string, ownerId?: string) => Promise<string | undefined>>(),
    retrieveRoomIdByAccess:
        jest.fn<
            (
                _: string,
                isPrivate?: boolean,
                ownerId?: string,
            ) => Promise<string | undefined>
        >(),
    updateRoomAccess:
        jest.fn<(_: string, isPrivate: boolean) => Promise<void>>(),
}
