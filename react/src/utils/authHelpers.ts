import * as plantService from "../service/plant.service.tsx";

export const createUserSession = (response: any) => {
    const token = response.token;
    window.sessionStorage.setItem("jwt", token);
};

export const failedCreateSession = (error: string, setError: React.Dispatch<React.SetStateAction<string>>) => {
    window.sessionStorage.removeItem("jwt");
    setError(error as string);
};

export const loginUser = async (email: string, password: string) => {
    const response = await plantService.loginWithEmailPassword(email, password);            
    createUserSession(response);
};

export const loginGuestUser = async () => {
    const response = await plantService.loginGuest();
    createUserSession(response);
};

export const createUser = async (displayName: string, email: string, password: string) => {
    const response = await plantService.signupWithEmailPassword(displayName, email, password);
    createUserSession(response);
};