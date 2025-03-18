import * as plantService from "../service/plant.service.tsx";
import { jwtDecode } from "jwt-decode";

import { UserContextType, UserContextType } from "../components/user.context";

const parseToken = (token: string) : UserContextObjectType => {
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
    window.sessionStorage.setItem("jwt", token);

    console.log(token);

    const userContextValue = parseToken(token);
    
    if (!userContextValue.isGuest) {
        const displayName = await plantService.retrieveDisplayName(userContextValue.userId, token);    
        userContextValue.displayName = displayName;
    }

    console.log(JSON.stringify(userContext));
    userContext.set(userContextValue); 
};

export const failedCreateSession = (error: string, setError: React.Dispatch<React.SetStateAction<string>>, userContext: UserContextType) => {
    window.sessionStorage.removeItem("jwt");
    console.log(JSON.stringify(userContext));
    userContext.set({ sessionActive: false }); 

    setError(error as string);
};

export const loginUser = async (email: string, password: string, userContext: UserContextType) => {
    const response = await plantService.loginWithEmailPassword(email, password);
    console.log(JSON.stringify(response));            
    await createUserSession(response, userContext);
};

export const loginGuestUser = async (userContext: UserContextType) => {
    const response = await plantService.loginGuest();
    await createUserSession(response, userContext);
};

export const createUser = async (displayName: string, email: string, password: string, userContext: UserContextType) => {
    const response = await plantService.signupWithEmailPassword(displayName, email, password);
    await createUserSession(response, userContext);
};