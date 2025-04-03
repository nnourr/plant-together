import { jest } from '@jest/globals';

export const authServiceMock = {
    signUpWithEmailPassword: jest.fn<(displayName: string, email: string, password: string) => Promise<string>>(),
    loginWithEmailPassword: jest.fn<(email: string, password: string) => Promise<string>>(),
    guestToken: jest.fn<() => Promise<string>>(),
    verifyFirebaseIdToken: jest.fn<(token: string) => Promise<Boolean>>(),
    getUserId: jest.fn<(token: string) => string>(),
    getDisplayName: jest.fn<(token: string) => Promise<string>>(),
    isGuestUser: jest.fn<(token: string) => boolean>(),
};
