import { createContext, useState, ReactNode } from "react";

type UserContextObjectType = {
    sessionActive: boolean;
    isGuest?: boolean;
    userId?: string;
    displayName?: string;
    email?: string;
};

export type UserContextType = {
    context: UserContextObjectType;
    set: React.Dispatch<React.SetStateAction<UserContextObjectType>> | undefined;
};

export const UserContext = createContext<UserContextType>({ 
    context: { sessionActive: false }
});

export const UserContextProvider: React.FC = ({ children }) => {
  const [userContextValue, setUserContextValue] = useState<UserContextObjectType>({ sessionActive: false });

  return (
    <UserContext.Provider value={{ context: userContextValue, set: setUserContextValue }}>
      {children}
    </UserContext.Provider>
  );
};