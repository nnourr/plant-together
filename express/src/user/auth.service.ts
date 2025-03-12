import fireauthRepo from "../firebase/fireauth.repo.js";
import { getFirebaseError } from "../firebase/error.service.js";
import { registerUser, retrieveDisplayName } from "./user.repo.js";
import { logger } from "../logger.js";
import { jwtDecode } from "jwt-decode";

export const signUpWithEmailPassword = async (displayName: string, email: string, password: string): Promise<string> => {
    try {
        const token = await fireauthRepo.signUpWithEmailPassword(email, password);
        const decoded = jwtDecode(token) as any;
        const userId = decoded.user_id;

        await registerUser(userId, displayName, email);

        return token;
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

export const getDisplayName = async (token: string): Promise<string> => {
    if (!token) return "";
    if ('Bearer ' === token.substring(0, 7)) token = token.substring(7);

    const decoded = jwtDecode(token) as any;

    return await retrieveDisplayName(decoded.user_id);
};
