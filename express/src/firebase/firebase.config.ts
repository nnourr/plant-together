export const FIREBASE_CONFIG = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID
};

export const FIREBASE_BAD_REQUEST_ERRRORS: Record<string, string> = {
    'auth/email-already-in-use': 'The email address is already registered.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/weak-password': 'The password is too weak.',
    'auth/user-not-found': 'The email address is not registered.',
    'auth/invalid-credential': 'The email address or password is incorrect.', // gotta love outdated docs https://firebase.google.com/docs/reference/node/firebase.auth.Auth?_gl=1*1nw8dom*_up*MQ..*_ga*MjI3MzcyMDQ5LjE3NDExMTc2MTg.*_ga_CW55HF8NVT*MTc0MTExNzYxOC4xLjAuMTc0MTExNzYxOC4wLjAuMA..#error-codes_11
    'auth/wrong-password': 'The password is incorrect.'
};

export const FIREBASE_SERVER_ERRRORS: Record<string, string> = {
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/internal-error': 'An unexpected error occurred. Please try again later.',
    'auth/user-disabled': 'This account has been disabled.'
};