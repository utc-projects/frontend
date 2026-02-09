import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const NotificationManager = () => {
  const socket = useSocket();

  // Internal connection state tracking for robustness
  const [isConnected, setIsConnected] = React.useState(socket?.connected || false);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      console.log('✅ [Manager] Connected');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('❌ [Manager] Disconnected');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log('🔔 [Manager] Notification Received:', notification);

      // Deduplicate by ID
      const toastId = notification._id || `toast-${Date.now()}`;
      toast.dismiss(toastId);

      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Thông báo mới</span>
          <span className="text-sm">{notification.message || 'Có tin nhắn mới'}</span>
        </div>,
        {
          duration: 5000,
          position: 'bottom-right',
          id: toastId,
        }
      );
    };

    // Listen for SPECIFIC event
    socket.on('notification', handleNewNotification);

    // Safety Net: Listen for ANY event to ensure we catch it
    const onAny = (eventName, ...args) => {
      if (eventName === 'notification') {
        // Only trigger if we haven't processed it yet (optional check, but toast dedupe handles it)
        const notification = args[0];
        // handleNewNotification is called by socket.on('notification') usually.
        // But if that fails, we can rely on this.
        // For now, let's trust toast's ID deduplication to prevent doubles.
        handleNewNotification(notification);
      }
    };

    socket.onAny(onAny);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.offAny(onAny);
    };
  }, [socket]);

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: '',
        style: {
          zIndex: 9999,
        },
      }}
    />
  );
};

export default NotificationManager;
