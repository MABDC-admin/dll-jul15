import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ScheduleBuilder from './ScheduleBuilder';
import { CalendarDays } from 'lucide-react';

export default async function TeacherSchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });

  if (!user || !user.teacherProfile) {
    redirect('/login');
  }

  const schedules = await prisma.schedule.findMany({
    where: { teacherProfileId: user.teacherProfile.id },
    orderBy: { timeStart: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Class Schedules</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your weekly instructional timetable</p>
        </div>
      </div>

      <ScheduleBuilder schedules={schedules} profile={user.teacherProfile} />
    </div>
  );
}
