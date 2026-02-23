import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        // Connect to backend URL from env or default
        const newSocket = io(import.meta.env.VITE_API_URL);
        setSocket(newSocket);

        // Clean up
        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket && user) {
            const userId = user._id || user.id;

            const joinRoom = () => {
                console.log('🔌 Socket Connected - Joining Room:', userId);
                socket.emit('join_room', userId);
            };

            // Join if already connected
            if (socket.connected) {
                joinRoom();
            }

            // Listen for connection events (reconnects)
            socket.on('connect', joinRoom);

            return () => {
                socket.off('connect', joinRoom);
            };
        }
    }, [socket, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
