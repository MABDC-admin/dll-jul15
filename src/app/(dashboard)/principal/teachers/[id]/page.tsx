import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Calendar, Clock, BookOpen, Users, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function TeacherDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    redirect('/login');
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      schedules: {
        orderBy: { timeStart: 'asc' }
      }
    }
  });

  if (!teacher) {
    notFound();
  }

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <Link href="/principal/teachers" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Teachers Directory
        </Link>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-6">
          <img src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user.name)}&background=random`} alt={teacher.user.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-50" />
          <div>
            <h2 className="text-2xl font-black text-slate-800">{teacher.user.name}</h2>
            <p className="text-sm font-semibold text-slate-500">{teacher.department || 'Unassigned Department'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800">Weekly Class Schedule</h3>
        <p className="text-sm text-slate-500">Read-only view of the instructional timetable configured by the teacher.</p>

        {DAYS.map(day => {
          const dayBlocks = teacher.schedules.filter(s => s.day === day);
          if (dayBlocks.length === 0) return null;

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" /> {day}
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {dayBlocks.map(block => (
                  <div key={block.id} className="p-4 flex flex-col md:flex-row md:items-center gap-8 hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 min-w-[140px]">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {formatTime(block.timeStart)} - {formatTime(block.timeEnd)}
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><BookOpen className="w-3 h-3" /> Subject</span>
                        <span className="text-sm font-bold text-slate-800">{block.subjectName}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3" /> Class</span>
                        <span className="text-sm font-semibold text-slate-600">{block.gradeId} - {block.sectionName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {teacher.schedules.length === 0 && (
          <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500 font-medium">
            This teacher has not built their class schedule yet.
          </div>
        )}
      </div>
    </div>
  );
}
