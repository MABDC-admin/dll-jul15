import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function DLLListPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'TEACHER') {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: {
        include: { 
          lessonLogs: { 
            select: {
              id: true,
              learningArea: true,
              term: true,
              weekNumber: true,
              submittedDate: true,
              status: true,
              remarks: true
            },
            orderBy: { submittedDate: 'desc' } 
          } 
        }
      }
    }
  });

  const dlls = user?.teacherProfile?.lessonLogs || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">My Submitted Lesson Logs</h3>
            <p className="text-xs text-slate-400 mt-1">Track the status of your instructional designs.</p>
          </div>
          <Link href="/teacher/dll/create" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New DLL
          </Link>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {dlls.map(e => (
            <div key={e.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">{e.learningArea} - Week {e.weekNumber}</p>
                <p className="text-[10px] text-slate-400">Date Submitted: {e.submittedDate.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={e.status} />
                {e.status === 'For Revision' && (
                  <Link href={`/teacher/dll/${e.id}/edit`} className="text-[11px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white px-3 py-1 rounded border border-amber-200 transition">
                    Edit & Resubmit
                  </Link>
                )}
                {e.remarks && <p className="text-[11px] italic text-amber-600">"{e.remarks}"</p>}
              </div>
            </div>
          ))}
          {dlls.length === 0 && (
            <div className="py-10 text-center text-slate-500 text-xs">
              You haven't submitted any Lesson Logs yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
