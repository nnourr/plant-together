import { jest } from '@jest/globals'

export const userRepoMock = {
  registerUser: jest.fn<(_: string, H: string, G: string) => Promise<void>>(),
  retrieveDisplayName: jest.fn<(_: string) => Promise<string>>(),
}
