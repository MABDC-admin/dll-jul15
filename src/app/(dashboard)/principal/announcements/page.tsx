import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Megaphone, Plus, Image as ImageIcon, Video, Calendar, Edit2, Trash2 } from 'lucide-react';
import DeleteAnnouncementButton from './DeleteAnnouncementButton';
import ToggleAnnouncementStatus from './ToggleAnnouncementStatus';

export default async function PrincipalAnnouncementsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PRINCIPAL') redirect('/login');

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Announcements & Broadcasts
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage global announcements that will pop up for all teachers.</p>
        </div>
        
        <Link href="/principal/announcements/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md transition flex items-center gap-2 w-max">
          <Plus className="w-4 h-4" /> Create Broadcast
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              <Megaphone className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">No announcements published.</p>
          </div>
        ) : (
          announcements.map(announcement => {
            const isScheduled = announcement.publishAt > new Date();
            let statusLabel = 'INACTIVE';
            let statusColor = 'bg-slate-100 text-slate-500';
            
            if (announcement.isActive) {
              if (isScheduled) {
                statusLabel = 'SCHEDULED';
                statusColor = 'bg-amber-100 text-amber-700';
              } else {
                statusLabel = 'ACTIVE';
                statusColor = 'bg-emerald-100 text-emerald-700';
              }
            }

            return (
              <div key={announcement.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group">
                {announcement.mediaUrl && (
                  <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 relative shrink-0 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden">
                    {announcement.mediaType === 'image' ? (
                      <img src={announcement.mediaUrl} alt="Announcement Media" className="w-full h-full object-cover" />
                    ) : (
                      <video src={announcement.mediaUrl} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 left-2 bg-black/50 text-white backdrop-blur-sm p-1.5 rounded-md">
                      {announcement.mediaType === 'image' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </div>
                  </div>
                )}
                <div className="p-6 flex flex-col justify-between w-full">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-slate-800">{announcement.title}</h3>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <ToggleAnnouncementStatus id={announcement.id} isActive={announcement.isActive} />
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/principal/announcements/${announcement.id}/edit`} 
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Announcement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <DeleteAnnouncementButton id={announcement.id} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Calendar className="w-4 h-4" /> {isScheduled ? 'Scheduled for ' : 'Published '} {new Date(announcement.publishAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
