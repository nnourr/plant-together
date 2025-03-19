import { jest } from '@jest/globals';

export const firebaseMock={
    signUpWithEmailPassword: jest.fn<(_: string, G: string)=> Promise<string>>(),
    loginWithEmailPassword: jest.fn<(_: string, G: string)=> Promise<string>>(),
    guestToken: jest.fn<()=> Promise<string>>(),
    verifyFirebaseIdToken: jest.fn<(_: string)=> Promise<Boolean>>(),
};
