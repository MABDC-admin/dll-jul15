'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getNotifications, markNotificationsAsRead } from '@/app/actions/notifications';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

type Notification = {
  id: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: Date;
};

type SocketContextType = {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: () => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Fetch initial notifications
    getNotifications().then((data) => {
      setNotifications(data);
    });

    // Initialize socket
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || '', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket', socketInstance.id);
      if (session?.user) {
        // Join user's personal room
        socketInstance.emit('join', `USER_${(session.user as any).id}`);
        // Join role room
        socketInstance.emit('join', `ROLE_${(session.user as any).role}`);
      }
    });

    socketInstance.on('new-notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markNotificationsAsRead();
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
}
