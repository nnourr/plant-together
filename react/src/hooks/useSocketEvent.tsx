import { useEffect } from 'react';
import { useSocket } from './useSocket';

export const useSocketEvent = (eventName: string, callback: any) => {
  const socket = useSocket();

  useEffect(() => {
    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};