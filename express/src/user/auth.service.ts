import fireauthRepo from "../firebase/fireauth.repo.js";
import { getFirebaseError } from "../firebase/error.service.js";
import { registerUser } from "./user.repo.js";

export const signUpWithEmailPassword = async (displayName: string, email: string, password: string): Promise<string> => {
    try {
        const userId = await fireauthRepo.signUpWithEmailPassword(email, password);
        await registerUser(userId, displayName, email);

        return userId;
    } catch (error: any) {
        const firebaseError = getFirebaseError(error.code);
        throw firebaseError;
    }
};

export const loginWithEmailPassword = async (email: string, password: string): Promise<string> => {
    try {
        const token = await fireauthRepo.loginWithEmailPassword(email, password);
        return token;
    } catch (error: any) {
        const firebaseError = getFirebaseError(error.code);
        throw firebaseError;
    }
}

export const verifyFirebaseIdToken = async (token: string): Promise<Boolean> => {
    if (!token) return false;
    return fireauthRepo.verifyFirebaseIdToken(token);
}