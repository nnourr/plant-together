import { APIError } from '../types.js'
import { FIREBASE_ERRORS } from './firebase.config.js'

export const getFirebaseError = (errorCode: any): APIError => {
  return FIREBASE_ERRORS[errorCode] || FIREBASE_ERRORS['auth/internal-error']
}
