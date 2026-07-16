'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const initializedRef = useRef(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Don't initialize until session is loaded
    if (status !== 'authenticated' || !session?.user) return;
    
    // Prevent duplicate initialization
    if (initializedRef.current && socketRef.current?.connected) return;
    initializedRef.current = true;

    // Fetch initial notifications (only once)
    getNotifications().then((data) => {
      setNotifications(data);
    });

    // Reuse existing socket or create new one
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || '', {
      path: '/api/socket',
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      if (session?.user) {
        socketInstance.emit('join', `USER_${(session.user as any).id}`);
        socketInstance.emit('join', `ROLE_${(session.user as any).role}`);
      }
    });

    socketInstance.on('new-notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      initializedRef.current = false;
    };
  }, [status, session?.user?.id]);

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
