import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { FileText, CheckCircle, BookMarked, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';
import TeacherToolsSwitcher from './TeacherToolsSwitcher';

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: {
        include: { lessonLogs: { take: 5, orderBy: { submittedDate: 'desc' } } }
      }
    }
  });

  const grades = await prisma.gradeLevel.findMany({ orderBy: { level: 'asc' } });
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });

  if (!user || !user.teacherProfile) {
    return <div>Teacher profile not found.</div>;
  }

  const profile = user.teacherProfile;
  const subjectsAssigned = JSON.parse(profile.subjects).length;

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
          { label: "Total DLLs Submitted", val: profile.totalSubmitted, icon: FileText },
          { label: "Approved Logs", val: profile.approved, icon: CheckCircle },
          { label: "Assigned Subjects", val: subjectsAssigned, icon: BookMarked },
          { label: "Compliance Rate", val: `${profile.complianceRate}%`, icon: FileCheck }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{c.label}</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{c.val}</p>
              <div className="flex justify-end mt-2">
                <Icon className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">My Recent Submissions</h3>
            </div>
            <Link href="/teacher/dll" className="text-xs text-indigo-600 font-bold hover:underline">View All</Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {profile.lessonLogs.map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition group">
                <div>
                  <p className="text-xs font-bold text-slate-800">{entry.learningArea}</p>
                  <p className="text-[11px] text-slate-500">{entry.weekNumber} • Submitted: {entry.submittedDate.toLocaleDateString()}</p>
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
            ))}
            {profile.lessonLogs.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                You haven't submitted any Lesson Logs yet.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <TeacherToolsSwitcher grades={grades} subjects={subjects} />
        </div>
      </div>
    </div>
  );
}
