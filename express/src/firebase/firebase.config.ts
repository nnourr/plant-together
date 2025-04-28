import { APIError } from '../types.js'

export const FIREBASE_CONFIG = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
}

export const SERVICE_ACCOUNT_CREDENTIAL: string = JSON.parse(
    process.env.SERVICE_ACCOUNT_CREDENTIAL || '{}',
)

export const FIREBASE_ERRORS: Record<string, APIError> = {
    'auth/email-already-in-use': {
        error: 'The email address is already registered.',
        status: 409,
    },
    'auth/invalid-email': {
        error: 'The email address is not valid.',
        status: 400,
    },
    'auth/weak-password': { error: 'The password is too weak.', status: 400 },
    'auth/user-not-found': {
        error: 'The email address is not registered.',
        status: 404,
    },
    'auth/invalid-credential': {
        error: 'The email address or password is incorrect.',
        status: 401,
    },
    'auth/wrong-password': { error: 'The password is incorrect.', status: 401 },
    'auth/operation-not-allowed': {
        error: 'This operation is not allowed.',
        status: 500,
    },
    'auth/internal-error': {
        error: 'An unexpected error occurred. Please try again later.',
        status: 500,
    },
    'auth/user-disabled': {
        error: 'This account has been disabled.',
        status: 403,
    },
}
