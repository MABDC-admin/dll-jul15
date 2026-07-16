import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import DepartmentAssignmentManager from '@/components/departments/DepartmentAssignmentManager';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function DepartmentLoadsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    redirect('/login');
  }

  const { id } = await params;

  const department = await prisma.department.findUnique({
    where: { id }
  });

  if (!department) {
    notFound();
  }

  // Find all teachers assigned to this department
  const teachers = await prisma.teacherProfile.findMany({
    where: { department: department.name },
    include: { user: true }
  });

  const unassignedTeachers = await prisma.teacherProfile.findMany({
    where: {
      department: { not: department.name }
    },
    include: { user: true }
  });

  const grades = await prisma.gradeLevel.findMany({ orderBy: { level: 'asc' } });
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="w-full space-y-6">
      <Link href="/principal/departments" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 w-fit">
        <ChevronLeft className="w-4 h-4" /> Back to Departments
      </Link>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{department.name}</h2>
        <p className="text-sm text-slate-500">Manage Grade Levels, Subjects, and Sections for educators in this department.</p>
      </div>

      <DepartmentAssignmentManager 
        teachers={teachers} 
        unassignedTeachers={unassignedTeachers}
        allGrades={grades} 
        allSubjects={subjects} 
        departmentName={department.name} 
      />
    </div>
  );
}
