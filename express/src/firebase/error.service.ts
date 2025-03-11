import { APIError } from '../types.js';
import { FIREBASE_BAD_REQUEST_ERRRORS, FIREBASE_SERVER_ERRRORS } from './firebase.config.js';

export const getFirebaseError = (errorCode: any): APIError => {
    let error = FIREBASE_BAD_REQUEST_ERRRORS[errorCode];
    const status = error ? 400 : 500;

    error = error || FIREBASE_SERVER_ERRRORS[errorCode] || FIREBASE_SERVER_ERRRORS['auth/internal-error'];

    return { status, error };
};