import { prisma } from '@/lib/prisma';
import TeacherManager from '@/components/principal/TeacherManager';

export default async function TeachersDirectory() {
  const [teachers, allDepartments] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: { user: true },
      orderBy: { user: { name: 'asc' } }
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <TeacherManager initialTeachers={teachers} allDepartments={allDepartments} />
    </div>
  );
}
