import { initializeApp } from "firebase/app";
import admin from "firebase-admin";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_CONFIG } from "./firebase.config.js";
import { logger } from "../logger.js";

class FireauthRepo {
    static singleton: FireauthRepo;

    private clientAuth;
    private adminAuth;

    constructor() {
        const fireapp = initializeApp(FIREBASE_CONFIG);
        this.clientAuth = getAuth(fireapp);
        this.adminAuth = admin.initializeApp(FIREBASE_CONFIG).auth();
    }

    async verifyFirebaseIdToken(token: string): Promise<Boolean> {
        try {
            if ('Bearer ' === token.substring(0, 7)) token = token.substring(7);
            const decodedToken = await this.adminAuth.verifyIdToken(token);

            logger.log('Provided token is valid', JSON.stringify(decodedToken));
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async signUpWithEmailPassword(email: string, password: string): Promise<string> {
        const userCredential = await createUserWithEmailAndPassword(this.clientAuth, email, password);
        return userCredential.user.uid;
    }

    async loginWithEmailPassword(email: string, password: string): Promise<string> {
        const userCredential = await signInWithEmailAndPassword(this.clientAuth, email, password);
        return userCredential.user.getIdToken();
    }

    static instance(): FireauthRepo {
        if (!FireauthRepo.singleton) this.singleton = new FireauthRepo();
        return this.singleton;
    }
}

export default FireauthRepo.instance();
