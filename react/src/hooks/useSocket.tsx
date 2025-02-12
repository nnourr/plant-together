import React, { createContext, useContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "../context/SocketContext";

export const useSocket = (): Socket => {
    const socket = useContext(SocketContext);
    if (!socket) {
      throw new Error("useSocket must be used within a SocketProvider");
    }
    return socket;
};