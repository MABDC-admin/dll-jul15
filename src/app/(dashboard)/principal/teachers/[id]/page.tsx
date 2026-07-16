import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import TeacherProfileTabs from './TeacherProfileTabs';
import AvatarUpload from './AvatarUpload';
import { getCurrentTerm } from '@/lib/term';

export default async function TeacherDetailsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    redirect('/login');
  }

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  let termFilter: string | undefined = resolvedSearchParams?.term;
  
  if (!termFilter) {
    termFilter = getCurrentTerm();
  } else if (termFilter === 'all') {
    termFilter = undefined;
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: true,
      subjectLoads: true,
      schedules: {
        orderBy: { timeStart: 'asc' }
      },
      lessonLogs: {
        where: termFilter ? { term: termFilter } : undefined,
        select: {
          id: true,
          learningArea: true,
          term: true,
          weekNumber: true,
          teachingDates: true,
          submittedDate: true,
          status: true,
          remarks: true
        },
        orderBy: { submittedDate: 'desc' }
      }
    }
  });

  if (!teacher) {
    notFound();
  }

  const allGrades = await prisma.gradeLevel.findMany({ orderBy: { level: 'asc' } });
  const allSubjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <div>
        <Link href="/principal/teachers" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Teachers Directory
        </Link>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-6">
          <AvatarUpload 
            teacherProfileId={teacher.id} 
            currentAvatar={teacher.avatar} 
            teacherName={teacher.user.name} 
          />
          <div>
            <h2 className="text-2xl font-black text-slate-800">{teacher.user.name}</h2>
            <p className="text-sm font-semibold text-slate-500">{teacher.department || 'Unassigned Department'}</p>
          </div>
        </div>
      </div>

      <TeacherProfileTabs 
        schedules={teacher.schedules} 
        lessonLogs={teacher.lessonLogs} 
        profile={teacher} 
        allGrades={allGrades}
        allSubjects={allSubjects}
      />
    </div>
  );
}
