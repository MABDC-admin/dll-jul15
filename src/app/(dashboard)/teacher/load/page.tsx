import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import TeacherLoadManager from '@/components/teacher/TeacherLoadManager';

export const dynamic = 'force-dynamic';

export default async function TeacherLoadPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: {
        include: { 
          lessonLogs: { 
            orderBy: { submittedDate: 'desc' } 
          } 
        }
      }
    }
  });

  if (!user || !user.teacherProfile) {
    return <div>Teacher profile not found. Please contact an administrator.</div>;
  }

  const profile = user.teacherProfile;
  
  let assignedSubjects: string[] = [];
  let assignedGrades: string[] = [];
  try {
    assignedSubjects = JSON.parse(profile.subjects || '[]');
    assignedGrades = JSON.parse(profile.gradeLevels || '[]');
  } catch (e) {
    console.error("Failed to parse teacher load", e);
  }

  const lessonLogs = profile.lessonLogs.map(log => {
    let topic = 'No topic specified';
    try {
      const content = JSON.parse(log.content || '{}');
      topic = (content.topic || topic).replace(/<[^>]*>?/gm, '');
    } catch {}

    return {
      id: log.id,
      date: log.teachingDates,
      learningArea: log.learningArea,
      topic,
      status: log.status,
      submittedDate: log.submittedDate
    };
  });

  return (
    <div className="w-full space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">My Subject Load Workspace</h1>
          <p className="text-teal-100 text-sm max-w-xl">
            Select a subject from your official load below to construct a new Daily Lesson Log or review your submission history specifically for that class.
          </p>
        </div>
      </div>
      
      <TeacherLoadManager 
        assignedSubjects={assignedSubjects} 
        assignedGrades={assignedGrades}
        lessonLogs={lessonLogs} 
      />
    </div>
  );
}
