import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { FileText, CheckCircle, BookMarked, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import TeacherToolsSwitcher from './TeacherToolsSwitcher';
import AnnouncementModal from '@/components/ui/AnnouncementModal';

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: {
        include: { 
          lessonLogs: { take: 5, orderBy: { submittedDate: 'desc' } },
          anecdotalRecords: { take: 5, orderBy: { submittedDate: 'desc' }, include: { learner: true } },
          subjectLoads: true
        }
      }
    }
  });

  const grades = await prisma.gradeLevel.findMany({ orderBy: { level: 'asc' } });
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });

  if (!user || !user.teacherProfile) {
    return <div>Teacher profile not found.</div>;
  }

  const profile = user.teacherProfile;
  const subjectsAssigned = profile.subjectLoads.length;

  const latestAnnouncement = await prisma.announcement.findFirst({
    where: { 
      isActive: true,
      publishAt: { lte: new Date() }
    },
    orderBy: { publishAt: 'desc' }
  });

  const viewedAnnouncements = profile.viewedAnnouncements || [];
  const shouldShowAnnouncement = latestAnnouncement && !viewedAnnouncements.includes(latestAnnouncement.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-teal-900 via-indigo-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
        <span className="bg-teal-500/30 text-teal-200 border border-teal-400/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
          Active Teacher Workspace
        </span>
        <h2 className="text-2xl font-black mt-3 text-white">
          Welcome Back, {user.name}
        </h2>
        <p className="text-xs text-indigo-100/90 mt-2">
          Fulfill s. 2026 guidelines by constructing high-quality instructional designs, managing daily student attendance, and logging interventions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total DLLs Submitted", val: profile.totalSubmitted, icon: FileText, color: "purple" },
          { label: "Approved Logs", val: profile.approved, icon: CheckCircle, color: "emerald" },
          { label: "Assigned Subjects", val: subjectsAssigned, icon: BookMarked, color: "blue" },
          { label: "Compliance Rate", val: `${profile.complianceRate}%`, icon: FileCheck, color: "teal" }
        ].map((c, i) => {
          const Icon = c.icon;

          const colorStyles: Record<string, string> = {
            blue: "bg-blue-50/50 border-blue-100 text-blue-600",
            purple: "bg-purple-50/50 border-purple-100 text-purple-600",
            emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
            teal: "bg-teal-50/50 border-teal-100 text-teal-600",
          };
          
          const iconBgStyles: Record<string, string> = {
            blue: "bg-blue-100 text-blue-700",
            purple: "bg-purple-100 text-purple-700",
            emerald: "bg-emerald-100 text-emerald-700",
            teal: "bg-teal-100 text-teal-700",
          };

          return (
            <div key={i} className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between transition hover:shadow-md ${colorStyles[c.color]}`}>
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
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent DLL Submissions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">My Recent DLL Submissions</h3>
              </div>
              <Link href="/teacher/dll" className="text-xs text-indigo-600 font-bold hover:underline">View All</Link>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {profile.lessonLogs.map((entry) => {
                const contentData = entry.content ? JSON.parse(entry.content) : {};
                const rawTopicStr = contentData.topic || 'No topic provided';
                const topicStr = rawTopicStr.replace(/<[^>]*>?/gm, '');
                return (
                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition group">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-800">{entry.learningArea}</p>
                    <p className="text-[11px] font-medium text-indigo-600 mt-0.5 truncate" title={topicStr}>
                      Topic: {topicStr}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                      W{entry.weekNumber} • {entry.submittedDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={entry.status} />
                    {entry.status === 'For Revision' && (
                      <Link href={`/teacher/dll/${entry.id}/edit`} className="text-[11px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white px-3 py-1 rounded border border-amber-200 transition opacity-0 group-hover:opacity-100">
                        Revise
                      </Link>
                    )}
                  </div>
                </div>
                );
              })}
              {profile.lessonLogs.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">
                  You haven't submitted any Lesson Logs yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Anecdotal Records */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Anecdotal Records</h3>
              </div>
              <Link href="/teacher/anecdotal" className="text-xs text-indigo-600 font-bold hover:underline">View All</Link>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {profile.anecdotalRecords.map((entry) => (
                <Link href={`/teacher/anecdotal/${entry.id}`} key={entry.id} className="block p-4 hover:bg-slate-50/60 transition group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-bold text-slate-800">{entry.learner.name}</p>
                      <p className="text-[11px] font-medium text-slate-600 mt-0.5 truncate">
                        {entry.incidentType} - {entry.description.substring(0, 60)}...
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                        {new Date(entry.incidentDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={entry.status} />
                    </div>
                  </div>
                </Link>
              ))}
              {profile.anecdotalRecords.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">
                  No anecdotal records submitted yet.
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="lg:col-span-1">
          <TeacherToolsSwitcher subjectLoads={profile.subjectLoads} />
        </div>
      </div>
      
      {shouldShowAnnouncement && latestAnnouncement && (
        <AnnouncementModal announcement={latestAnnouncement} />
      )}
    </div>
  );
}
