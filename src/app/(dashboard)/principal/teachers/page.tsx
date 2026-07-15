import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function TeachersDirectory() {
  const teachers = await prisma.teacherProfile.findMany({
    include: { user: true }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-base font-extrabold text-slate-800">Faculty & Instructional Roster</h2>
        <p className="text-xs text-slate-500">Track educators performance, assignments, and structural compliance ratios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex items-center space-x-3.5">
              <img src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.user.name)}&background=random`} alt={t.user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">{t.user.name}</h4>
                <p className="text-[11px] text-slate-400 font-semibold">{t.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 text-center bg-slate-50 rounded-xl text-[11px]">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Submitted</span>
                <span className="font-bold text-slate-800">{t.totalSubmitted}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Approved</span>
                <span className="font-bold text-emerald-600">{t.approved}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Rate</span>
                <span className="font-bold text-indigo-600">{t.complianceRate}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-500 font-semibold">Grades: <span className="text-slate-800">
                {(() => {
                  try { return JSON.parse(t.gradeLevels || '[]').join(", ") || 'Unassigned'; }
                  catch { return 'Unassigned'; }
                })()}
              </span></p>
              <p className="text-slate-500 font-semibold">Subjects: <span className="text-slate-800">
                {(() => {
                  try { return JSON.parse(t.subjects || '[]').join(", ") || 'Unassigned'; }
                  catch { return 'Unassigned'; }
                })()}
              </span></p>
            </div>

            <Link 
              href={`/principal/teachers/${t.id}`}
              className="block w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-bold py-2 rounded-lg transition text-center"
            >
              View Full History
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
