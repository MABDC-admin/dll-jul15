import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FilePlus2, Search, Filter, ClipboardList } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function TeacherAnecdotalPage() {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { teacherProfile: { include: { anecdotalRecords: { include: { learner: true }, orderBy: { submittedDate: 'desc' } } } } }
  });

  const records = user?.teacherProfile?.anecdotalRecords || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            My Anecdotal Records
          </h2>
          <p className="text-xs text-slate-500 mt-1">Submit and track behavioral incidents or observations of your learners.</p>
        </div>
        
        <Link href="/teacher/anecdotal/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md transition flex items-center gap-2 w-max">
          <FilePlus2 className="w-4 h-4" /> File New Record
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search learner..." className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition" />
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
              <p className="text-sm font-medium">No anecdotal records submitted yet.</p>
              <Link href="/teacher/anecdotal/create" className="text-indigo-600 text-xs font-bold hover:underline">File your first record</Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Learner</th>
                    <th className="p-4 hidden md:table-cell">Incident Description</th>
                    <th className="p-4 hidden lg:table-cell">Dates</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {records.map(record => (
                    <tr key={record.id} className="transition hover:bg-slate-50/50">
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs border border-indigo-100 shadow-sm flex-shrink-0">
                            {record.learner.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{record.learner.name}</div>
                            <div className="inline-block mt-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 text-[10px]">{record.learner.gradeSection}</div>
                          </div>
                        </div>
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
                        <Link href={`/teacher/anecdotal/${record.id}`} className="inline-block text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition">
                          View Details
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
