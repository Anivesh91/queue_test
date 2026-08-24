import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket.IO] Connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket.IO] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[Socket.IO] Connection error:', error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinTicketRoom = (publicToken, ticketId) => {
    if (socket && socket.connected) {
      socket.emit('join:ticket', { publicToken, ticketId });
    }
  };

  const joinServiceRoom = (serviceId) => {
    if (socket && socket.connected) {
      socket.emit('join:service', { serviceId });
    }
  };

  const joinOwnerRoom = (ownerId) => {
    if (socket && socket.connected) {
      const token = localStorage.getItem('queueless_token');
      socket.emit('join:owner', { ownerId, token });
    }
  };

  const leaveTicketRoom = (ticketId) => {
    if (socket && socket.connected) {
      socket.emit('leave:ticket', { ticketId });
    }
  };

  const leaveServiceRoom = (serviceId) => {
    if (socket && socket.connected) {
      socket.emit('leave:service', { serviceId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinTicketRoom,
        joinServiceRoom,
        joinOwnerRoom,
        leaveTicketRoom,
        leaveServiceRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
