import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditAnnouncementForm from './EditAnnouncementForm';

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const announcement = await prisma.announcement.findUnique({
    where: { id }
  });

  if (!announcement) notFound();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800">Edit Broadcast Announcement</h3>
        <p className="text-xs text-slate-500 mt-1">Update details, toggle visibility, or reschedule this broadcast.</p>
      </div>
      <EditAnnouncementForm announcement={announcement} />
    </div>
  );
}
