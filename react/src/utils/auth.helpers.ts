import * as plantService from "../service/plant.service.tsx";
import { jwtDecode } from "jwt-decode";

import { UserContextType, UserContextObjectType } from "../components/user.context";

export const parseToken = (token: string) : UserContextObjectType => {
    const decoded = jwtDecode(token) as any;

    return {
        sessionActive: true,
        userId: decoded.user_id,
        email: decoded.email,
        isGuest: decoded.isGuest || false,
        expiry: decoded.exp
    };
};

export const createUserSession = async (response: any, userContext: UserContextType) => {
    const token = response.token;
    window.localStorage.setItem("jwt", token);

    const userContextValue = parseToken(token);
    
    if (!userContextValue.isGuest) {
        const response = await plantService.retrieveDisplayName(token);    
        userContextValue.displayName = response.displayName;
    }

    userContext.set && userContext?.set(userContextValue); 
};

export const endSession = (userContext: UserContextType) => {
    window.localStorage.removeItem("jwt");
    userContext.set && userContext.set({ sessionActive: false }); 
};

export const failedCreateSession = (error: string, setError: React.Dispatch<React.SetStateAction<string>>, userContext: UserContextType) => {
    endSession(userContext);
    setError(error as string);
};

export const loginUser = async (email: string, password: string, userContext: UserContextType) => {
    const response = await plantService.loginWithEmailPassword(email, password);

    console.log('Successfully logged in user. Creating session');
    await createUserSession(response, userContext);
};

export const loginGuestUser = async (userContext: UserContextType) => {
    const response = await plantService.loginGuest();

    console.log('Successfully logged in guest user. Creating session');
    await createUserSession(response, userContext);
};

export const createUser = async (displayName: string, email: string, password: string, userContext: UserContextType) => {
    const response = await plantService.signupWithEmailPassword(displayName, email, password);

    console.log('Successfully created new user. Creating session');
    await createUserSession(response, userContext);
};