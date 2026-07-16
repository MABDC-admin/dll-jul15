import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import DLLFilterForm from './DLLFilterForm';
import { getCurrentTerm } from '@/lib/term';
import { safeJsonParse } from '@/lib/utils';

export default async function DDLReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; term?: string; week?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  let termFilter: string | undefined = resolvedParams.term;
  
  if (!termFilter) {
    termFilter = getCurrentTerm();
  } else if (termFilter === 'all') {
    termFilter = undefined;
  }
  
  const weekNumber = resolvedParams.week || undefined;

  const dllEntries = await prisma.lessonLog.findMany({
    where: {
      term: termFilter,
      weekNumber: weekNumber,
      OR: [
        { teacherProfile: { user: { name: { contains: query } } } },
        { learningArea: { contains: query } }
      ]
    },
    select: {
      id: true,
      learningArea: true,
      term: true,
      weekNumber: true,
      submittedDate: true,
      status: true,
      teacherProfile: {
        select: {
          gradeLevels: true,
          sections: true,
          user: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { submittedDate: 'desc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800">Teacher Daily Lesson Log (DLL) Entry Log</h3>
        <DLLFilterForm />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Educator / Teacher</th>
              <th className="py-3 px-4">Grade & Section</th>
              <th className="py-3 px-4">Learning Area</th>
              <th className="py-3 px-4">Term & Week</th>
              <th className="py-3 px-4">Date Submitted</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {dllEntries.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/50 transition">
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {e.teacherProfile.user.name}
                  <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">ID: {e.id.slice(0, 8)}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {(safeJsonParse<string[]>(e.teacherProfile.gradeLevels, [])[0] || 'Unassigned')} - {(safeJsonParse<string[]>(e.teacherProfile.sections, [])[0] || 'Unassigned')}
                </td>
                <td className="py-3.5 px-4 font-semibold text-indigo-600">{e.learningArea}</td>
                <td className="py-3.5 px-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-[10px] border border-slate-200 whitespace-nowrap">
                    {e.term} - Wk {e.weekNumber}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{e.submittedDate.toLocaleString()}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={e.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link href={`/principal/dll/${e.id}`} className="text-xs bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold px-3 py-1.5 rounded-lg transition border border-indigo-100 inline-flex items-center gap-1">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {dllEntries.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-slate-600">No Lesson Logs found</span>
                  <span className="text-xs mt-1">Try adjusting your Term or Week filters</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
