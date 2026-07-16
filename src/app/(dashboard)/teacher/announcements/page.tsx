import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Megaphone, Image as ImageIcon, Video, Calendar } from 'lucide-react';

export default async function TeacherAnnouncementsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TEACHER') redirect('/login');

  const announcements = await prisma.announcement.findMany({
    where: { 
      isActive: true,
      publishAt: { lte: new Date() }
    },
    orderBy: { publishAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          Announcements & Broadcasts
        </h2>
        <p className="text-xs text-slate-500 mt-1">View all past and current broadcasts from the Academic Director.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              <Megaphone className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">No announcements published yet.</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div key={announcement.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-indigo-200 transition">
              {announcement.mediaUrl && (
                <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 relative shrink-0 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden">
                  {announcement.mediaType === 'image' ? (
                    <img src={announcement.mediaUrl} alt="Announcement Media" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                  ) : (
                    <video src={announcement.mediaUrl} controls className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/50 text-white backdrop-blur-sm p-1.5 rounded-md">
                    {announcement.mediaType === 'image' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                </div>
              )}
              <div className="p-6 flex flex-col justify-between w-full">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">{announcement.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Calendar className="w-4 h-4" /> Published {new Date(announcement.publishAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
