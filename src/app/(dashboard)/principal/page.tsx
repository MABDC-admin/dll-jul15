import { prisma } from '@/lib/prisma';
import { Users, FileText, Clock, AlertTriangle, CheckCircle, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function PrincipalDashboard() {
  const teachersCount = await prisma.teacherProfile.count();
  const submittedLogs = await prisma.lessonLog.count();
  const pendingLogs = await prisma.lessonLog.count({ where: { status: 'Pending Review' } });
  const forRevisionLogs = await prisma.lessonLog.count({ where: { status: 'For Revision' } });
  const approvedLogs = await prisma.lessonLog.count({ where: { status: 'Approved' } });
  
  const complianceRate = submittedLogs > 0 ? ((approvedLogs / submittedLogs) * 100).toFixed(1) : 0;

  const recentLogs = await prisma.lessonLog.findMany({
    take: 10,
    orderBy: { submittedDate: 'desc' },
    include: { teacherProfile: { include: { user: true } } }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            School Principal Console
          </span>
          <h2 className="text-2xl font-black mt-3 text-white leading-tight">Welcome, Principal</h2>
          <p className="text-xs text-indigo-100/90 mt-2 leading-relaxed">
            Assess flexible and context-responsive Daily Lesson Logs (DLL) adhering to active DepEd Order guidelines. Verify and assist teaching staff across MABDC.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Teachers", val: teachersCount, icon: Users },
          { label: "Submitted Logs", val: submittedLogs, icon: FileText },
          { label: "Pending DDL Review", val: pendingLogs, icon: Clock },
          { label: "For Revision", val: forRevisionLogs, icon: AlertTriangle },
          { label: "Approved Logs", val: approvedLogs, icon: CheckCircle },
          { label: "Compliance Rate", val: `${complianceRate}%`, icon: FileCheck }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase leading-tight">{c.label}</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Icon className="w-4 h-4" /></span>
              </div>
              <span className="text-xl font-extrabold text-slate-800 mt-2">{c.val}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Lesson Log Submissions</h3>
              <p className="text-xs text-slate-400">Live operational feed of educator instructional designs</p>
            </div>
            <Link href="/principal/dll" className="text-xs text-indigo-600 font-bold hover:underline">View All</Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[350px]">
            {recentLogs.map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                    {entry.teacherProfile.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{entry.teacherProfile.user.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(JSON.parse(entry.teacherProfile.gradeLevels)[0] || 'Unassigned Grade')} • <span className="font-semibold">{entry.learningArea}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={entry.status} />
                  <Link href={`/principal/dll/${entry.id}`} className="bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded hover:bg-indigo-700 transition">
                    Review
                  </Link>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                No recent submissions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
