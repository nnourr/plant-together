import { initializeApp } from "firebase/app";
import admin from "firebase-admin";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";
import { FIREBASE_CONFIG, SERVICE_ACCOUNT_CREDENTIAL } from "./firebase.config.js";
import { logger } from "../logger.js";
import { randomUUID } from "crypto";
import { log } from "console";

class FireauthRepo {
    private static singleton: FireauthRepo;

    private clientAuth;
    private adminAuth;

    constructor() {
        const fireapp = initializeApp(FIREBASE_CONFIG);

        this.clientAuth = getAuth(fireapp);
        this.adminAuth = admin.initializeApp({
            credential: admin.credential.cert(SERVICE_ACCOUNT_CREDENTIAL),
        }).auth();
    }

    async verifyFirebaseIdToken(token: string): Promise<Boolean> {
        try {
            if ('Bearer ' === token.substring(0, 7)) token = token.substring(7);
            const decodedToken = await this.adminAuth.verifyIdToken(token);

            logger.info(`Provided token is valid ${JSON.stringify(decodedToken)}`);
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async signUpWithEmailPassword(email: string, password: string): Promise<string> {
        const userCredential = await createUserWithEmailAndPassword(this.clientAuth, email, password);
        logger.info(`User created ${JSON.stringify(userCredential.user.uid)}`);

        return userCredential.user.getIdToken();
    }

    async loginWithEmailPassword(email: string, password: string): Promise<string> {
        const userCredential = await signInWithEmailAndPassword(this.clientAuth, email, password);
        logger.info(`User logged in ${JSON.stringify(userCredential.user.uid)}`);

        return userCredential.user.getIdToken();
    }

    async guestToken(): Promise<string> {
        const guestId = randomUUID();
        const customToken = await this.adminAuth.createCustomToken(guestId, { isGuest: true });
        const userCredential = await signInWithCustomToken(this.clientAuth, customToken);

        logger.info(`Guest token created with guest ID ${guestId}`);

        return await userCredential.user.getIdToken();
    }

    static instance(): FireauthRepo {
        if (!FireauthRepo.singleton) this.singleton = new FireauthRepo();
        return this.singleton;
    }
}

export default FireauthRepo.instance();
