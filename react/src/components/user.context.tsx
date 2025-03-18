import { createContext, useState } from "react";

export type UserContextObjectType = {
    sessionActive: boolean;
    isGuest?: boolean;
    userId?: string;
    displayName?: string;
    email?: string;
    expiry?: number;
};

export type UserContextType = {
    context: UserContextObjectType;
    set?: React.Dispatch<React.SetStateAction<UserContextObjectType>>;
};

export const UserContext = createContext<UserContextType>({ 
    context: { sessionActive: false }
});

export const UserContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [userContextValue, setUserContextValue] = useState<UserContextObjectType>({ sessionActive: false });

  return (
    <UserContext.Provider value={{ context: userContextValue, set: setUserContextValue }}>
      {children}
    </UserContext.Provider>
  );
};