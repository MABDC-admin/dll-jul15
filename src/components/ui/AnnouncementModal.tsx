'use client';

import { useState, useEffect } from 'react';
import { X, Megaphone, CheckCircle2 } from 'lucide-react';
import { Announcement } from '@prisma/client';
import { dismissAnnouncement } from '@/app/(dashboard)/teacher/actions/announcement';

interface AnnouncementModalProps {
  announcement: Announcement;
}

export default function AnnouncementModal({ announcement }: AnnouncementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // Use effect to ensure it only pops up on client-side mount
  useEffect(() => {
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await dismissAnnouncement(announcement.id);
      setIsOpen(false);
    } catch (e) {
      console.error('Failed to dismiss', e);
      setIsDismissing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold">
            <Megaphone className="w-5 h-5" />
            <span>New Broadcast from Academic Director</span>
          </div>
          <button 
            onClick={handleDismiss}
            disabled={isDismissing}
            className="p-1 hover:bg-white/20 rounded-full transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media (if any) */}
        {announcement.mediaUrl && (
          <div className="w-full max-h-[400px] bg-slate-900 flex items-center justify-center overflow-hidden">
            {announcement.mediaType === 'image' ? (
              <img src={announcement.mediaUrl} alt="Announcement" className="w-full h-full object-contain" />
            ) : (
              <video src={announcement.mediaUrl} controls autoPlay className="w-full h-full object-contain max-h-[400px]" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8 space-y-4">
          <h2 className="text-2xl font-black text-slate-800 leading-tight">
            {announcement.title}
          </h2>
          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
            {announcement.content}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleDismiss}
            disabled={isDismissing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow transition flex items-center gap-2 disabled:opacity-50"
          >
            {isDismissing ? 'Closing...' : (
              <>
                <CheckCircle2 className="w-4 h-4" /> I've read this
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
