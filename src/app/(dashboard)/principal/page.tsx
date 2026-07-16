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
            School Academic Director Console
          </span>
          <h2 className="text-2xl font-black mt-3 text-white leading-tight">Welcome, Academic Director</h2>
          <p className="text-xs text-indigo-100/90 mt-2 leading-relaxed">
            Assess flexible and context-responsive Daily Lesson Logs (DLL) adhering to active DepEd Order guidelines. Verify and assist teaching staff across MABDC.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Teachers", val: teachersCount, icon: Users, color: "blue" },
          { label: "Submitted Logs", val: submittedLogs, icon: FileText, color: "purple" },
          { label: "Pending DDL Review", val: pendingLogs, icon: Clock, color: "amber" },
          { label: "For Revision", val: forRevisionLogs, icon: AlertTriangle, color: "rose" },
          { label: "Approved Logs", val: approvedLogs, icon: CheckCircle, color: "emerald" },
          { label: "Compliance Rate", val: `${complianceRate}%`, icon: FileCheck, color: "teal" }
        ].map((c, i) => {
          const Icon = c.icon;
          
          const colorStyles: Record<string, string> = {
            blue: "bg-blue-50/50 border-blue-100 text-blue-600",
            purple: "bg-purple-50/50 border-purple-100 text-purple-600",
            amber: "bg-amber-50/50 border-amber-100 text-amber-600",
            rose: "bg-rose-50/50 border-rose-100 text-rose-600",
            emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
            teal: "bg-teal-50/50 border-teal-100 text-teal-600",
          };
          
          const iconBgStyles: Record<string, string> = {
            blue: "bg-blue-100 text-blue-700",
            purple: "bg-purple-100 text-purple-700",
            amber: "bg-amber-100 text-amber-700",
            rose: "bg-rose-100 text-rose-700",
            emerald: "bg-emerald-100 text-emerald-700",
            teal: "bg-teal-100 text-teal-700",
          };

          return (
            <div key={i} className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between transition hover:shadow-md ${colorStyles[c.color]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold tracking-wider uppercase leading-tight opacity-80`}>{c.label}</span>
                <span className={`p-1.5 rounded-lg ${iconBgStyles[c.color]}`}><Icon className="w-4 h-4" /></span>
              </div>
              <span className="text-2xl font-black mt-1">{c.val}</span>
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
            {recentLogs.map((entry) => {
              const contentObj = entry.content ? JSON.parse(entry.content) : {};
              const rawTopic = contentObj.topic || "No topic specified";
              const topicPreview = rawTopic.replace(/<[^>]*>?/gm, '');

              return (
                <div key={entry.id} className="p-4 flex flex-col hover:bg-slate-50/60 transition animate-fadeIn gap-3">
                  <div className="flex items-center justify-between">
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
                  <div className="pl-11 pr-4">
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        <span className="font-bold text-slate-700">Topic:</span> {topicPreview}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {recentLogs.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                No recent submissions.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Alerts & Updates */}
        <div className="flex flex-col gap-6">
          {/* Pending Anecdotals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Action Required</h3>
              <Link href="/principal/anecdotal" className="text-xs text-indigo-600 font-bold hover:underline">View</Link>
            </div>
            <div className="p-4 flex-1">
              <Link href="/principal/anecdotal" className="block p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Anecdotal Records</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-sm font-medium text-amber-700">Check pending behavior or incidental reports needing academic director resolution.</p>
              </Link>
            </div>
          </div>

          {/* Quick Broadcast Link */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 shadow-sm flex flex-col flex-1">
            <div className="p-4 border-b border-indigo-50/50">
              <h3 className="text-sm font-bold text-indigo-900">Global Communications</h3>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center flex-1 space-y-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 mb-1">Send a Broadcast</p>
                <p className="text-xs text-slate-500">Push announcements and pop-ups to all teacher dashboards instantly.</p>
              </div>
              <Link href="/principal/announcements/create" className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition">
                Create Broadcast
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
