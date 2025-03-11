import fireauthRepo from "../firebase/fireauth.repo.js";
import { getFirebaseError } from "../firebase/error.service.js";
import { registerUser } from "./user.repo.js";
import { logger } from "../logger.js";

export const signUpWithEmailPassword = async (displayName: string, email: string, password: string): Promise<string> => {
    try {
        const userId = await fireauthRepo.signUpWithEmailPassword(email, password);
        await registerUser(userId, displayName, email);

        return userId;
    } catch (error: any) {
        throw getFirebaseError(error.code);
    }
};

export const loginWithEmailPassword = async (email: string, password: string): Promise<string> => {
    try {
        return await fireauthRepo.loginWithEmailPassword(email, password);
    } catch (error: any) {
        throw getFirebaseError(error.code);
    }
};

export const guestLogin = async (): Promise<string> => {
    try {
        return await fireauthRepo.guestToken();
    } catch (error: any) {
        logger.error(error);
        throw getFirebaseError(error.code);
    }
};

export const verifyToken = async (token: string): Promise<Boolean> => {
    if (!token) return false;
    return fireauthRepo.verifyFirebaseIdToken(token);
};
