import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search, Filter, ClipboardList } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function PrincipalAnecdotalPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'PRINCIPAL') redirect('/login');

  const records = await prisma.anecdotalRecord.findMany({
    include: {
      learner: true,
      teacherProfile: { include: { user: true } }
    },
    orderBy: [
      { status: 'desc' }, // Pending Review comes before Resolved
      { submittedDate: 'desc' }
    ]
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Anecdotal Record Review
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review behavioral incidents reported by teachers and provide official resolutions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search learner or teacher..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition" />
          </div>
          <button className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition">
            <Filter className="w-3.5 h-3.5" /> <span>Filter</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <ClipboardList className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium">No anecdotal records to review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Learner</th>
                    <th className="p-4">Reported By</th>
                    <th className="p-4 hidden md:table-cell">Incident Description</th>
                    <th className="p-4 hidden lg:table-cell">Dates</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {records.map(record => (
                    <tr key={record.id} className={`transition ${record.status === 'Pending Review' ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-800">{record.learner.name}</div>
                        <div className="inline-block mt-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 text-[10px]">{record.learner.gradeSection}</div>
                      </td>
                      <td className="p-4 align-top font-semibold text-slate-700">
                        {record.teacherProfile.user.name}
                      </td>
                      <td className="p-4 align-top hidden md:table-cell">
                        <p className="line-clamp-2 max-w-sm text-slate-600">{record.description}</p>
                      </td>
                      <td className="p-4 align-top hidden lg:table-cell text-[10px] font-medium text-slate-500">
                        <div className="mb-1"><span className="font-bold">Incident:</span> {new Date(record.incidentDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                        <div><span className="font-bold">Filed:</span> {new Date(record.submittedDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 align-top">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="p-4 align-top text-right">
                        <Link href={`/principal/anecdotal/${record.id}`} className="inline-block text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition">
                          {record.status === 'Pending Review' ? 'Review' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
