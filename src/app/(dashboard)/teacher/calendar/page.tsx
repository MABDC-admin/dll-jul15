import { prisma } from '@/lib/prisma';
import CalendarView from '@/components/calendar/CalendarView';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function TeacherCalendarPage() {
  const session = await getServerSession(authOptions);
  
  // Teachers fetch all global events and their private events
  const events = await prisma.calendarEvent.findMany({
    where: {
      OR: [
        { isGlobal: true },
        { ownerId: session?.user?.id }
      ]
    },
    orderBy: { startDate: 'asc' }
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">School Calendar</h2>
          <p className="text-sm font-bold text-slate-500 mt-1">View school events and manage your private calendar tasks.</p>
        </div>
      </div>
      
      <CalendarView initialEvents={events} role="TEACHER" userId={session?.user?.id || ''} />
    </div>
  );
}
