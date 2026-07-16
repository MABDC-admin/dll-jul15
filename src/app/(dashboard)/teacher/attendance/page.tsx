import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AttendanceLog from './AttendanceLog';
import { UserCheck } from 'lucide-react';

export default async function AttendancePage() {
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

  // Parse assigned classes
  const assignedGrades = JSON.parse(user.teacherProfile.gradeLevels || '[]');
  const assignedSections = JSON.parse(user.teacherProfile.sections || '[]');

  // Fetch only learners that belong to the teacher's assigned classes
  const learners = await prisma.learner.findMany({
    where: {
      gradeId: { in: assignedGrades },
      gradeSection: { in: assignedSections }
    },
    orderBy: { name: 'asc' }
  });

  // Fetch existing attendance records for the teacher's assigned classes
  const existingRecords = await prisma.attendanceRecord.findMany({
    where: {
      gradeId: { in: assignedGrades },
      sectionName: { in: assignedSections }
    }
  });

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 animate-fadeIn">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Attendance</h2>
          <p className="text-sm text-slate-500 font-medium">Log and monitor attendance for your assigned sections</p>
        </div>
      </div>

      <AttendanceLog 
        assignedGrades={assignedGrades} 
        assignedSections={assignedSections} 
        learners={learners} 
        existingRecords={existingRecords}
      />
    </div>
  );
}
