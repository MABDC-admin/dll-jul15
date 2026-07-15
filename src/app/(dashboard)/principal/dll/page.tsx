import { prisma } from '@/lib/prisma';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function DDLReviewPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  const dllEntries = await prisma.lessonLog.findMany({
    where: {
      OR: [
        { teacherProfile: { user: { name: { contains: query } } } },
        { learningArea: { contains: query } }
      ]
    },
    include: {
      teacherProfile: { include: { user: true } }
    },
    orderBy: { submittedDate: 'desc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800">Teacher Daily Lesson Log (DLL) Entry Log</h3>
          <form className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              name="q"
              type="text" 
              placeholder="Search by Teacher Name or Subject..." 
              defaultValue={query}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
            />
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Entry ID</th>
              <th className="py-3 px-4">Educator / Teacher</th>
              <th className="py-3 px-4">Grade & Section</th>
              <th className="py-3 px-4">Learning Area</th>
              <th className="py-3 px-4">Date Submitted</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {dllEntries.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{e.id.slice(0, 12)}</td>
                <td className="py-3.5 px-4 font-bold text-slate-800">{e.teacherProfile.user.name}</td>
                <td className="py-3.5 px-4 text-slate-600">
                  {(JSON.parse(e.teacherProfile.gradeLevels)[0] || 'Unassigned')} - {(JSON.parse(e.teacherProfile.sections)[0] || 'Unassigned')}
                </td>
                <td className="py-3.5 px-4 font-semibold text-indigo-600">{e.learningArea}</td>
                <td className="py-3.5 px-4 text-slate-400">{e.submittedDate.toLocaleString()}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={e.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link href={`/principal/dll/${e.id}`} className="text-xs bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold px-3 py-1 rounded transition border border-indigo-100">
                    Review DLL
                  </Link>
                </td>
              </tr>
            ))}
            {dllEntries.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  No Lesson Logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
