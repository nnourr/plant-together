import React, { createContext, useContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useSocketEvent } from "../hooks/useSocketEvent";

export const SocketContext = createContext<Socket | null>(null);
const serverHttpUrl = "https://fcab-2607-f2c0-e6fd-fae0-5c70-a205-cf03-1cf7.ngrok-free.app";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const listenSocketEvent = useSocketEvent;
  useEffect(() => {
    const newSocket = io(serverHttpUrl);
    console.log(serverHttpUrl);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};