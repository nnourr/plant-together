// auth.service.ts (After Refactoring)
import { Fireauth } from '../firebase/fireauth.repo.js';
import { APIError } from '../types.js';
import { FIREBASE_ERRORS } from '../firebase/firebase.config.js';
import { registerUser, retrieveDisplayName } from "./user.repo.js";
import { logger } from "../logger.js";
import { jwtDecode } from "jwt-decode";
import { getFirebaseError } from "../firebase/error.service.js";

export class AuthService {
    // The Fireauth dependency is injected via the constructor.
    constructor(private fireauth: Fireauth) { }

    async signUpWithEmailPassword(displayName: string, email: string, password: string): Promise<string> {
        try {
            const token = await this.fireauth.signUpWithEmailPassword(email, password);
            const decoded = jwtDecode(token) as any;
            const userId = decoded.user_id;
            await registerUser(userId, displayName, email);
            return token;
        } catch (error: any) {
            throw getFirebaseError(error.code);
        }
    }

    async loginWithEmailPassword(email: string, password: string): Promise<string> {
        try {
            return await this.fireauth.loginWithEmailPassword(email, password);
        } catch (error: any) {
            throw getFirebaseError(error.code);
        }
    }

    async guestLogin(): Promise<string> {
        try {
            return await this.fireauth.guestToken();
        } catch (error: any) {
            logger.error(error);
            throw getFirebaseError(error.code);
        }
    }

    async verifyToken(token: string): Promise<Boolean> {
        if (!token) return false;
        return this.fireauth.verifyFirebaseIdToken(token);
    }

    async getDisplayName(token: string): Promise<string> {
        if (!token) return "";
        if ('Bearer ' === token.substring(0, 7)) token = token.substring(7);
        const decoded = jwtDecode(token) as any;
        return await retrieveDisplayName(decoded.user_id);
    }
}
