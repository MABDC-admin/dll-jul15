'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useSocket } from '@/providers/SocketProvider';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!isOpen && unreadCount > 0) {
      // If opening and there are unread, mark them as read immediately in DB
      markAsRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition relative flex items-center justify-center focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn origin-top-right">
          <div className="bg-slate-50 border-b border-slate-100 p-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" /> Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                You have no notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 hover:bg-slate-50 transition block ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                  <p className="text-xs text-slate-700 leading-relaxed mb-1">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.link && (
                      <Link href={n.link} onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition">
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
