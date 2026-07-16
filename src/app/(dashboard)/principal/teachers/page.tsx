import { prisma } from '@/lib/prisma';
import TeacherManager from '@/components/principal/TeacherManager';

export default async function TeachersDirectory() {
  const [teachers, allDepartments, allGrades] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: { 
        user: true,
        subjectLoads: true 
      }
    }),
    prisma.department.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.gradeLevel.findMany({
      orderBy: { level: 'asc' }
    })
  ]);

  // Create a map of gradeId -> level for fast lookup
  const gradeLevelMap = new Map(allGrades.map(g => [g.id, g.level]));
  // Fallback map just in case subjectLoads uses the name instead of id
  const gradeNameMap = new Map(allGrades.map(g => [g.name, g.level]));

  // Sort teachers by their lowest grade level assigned
  const sortedTeachers = teachers.sort((a, b) => {
    const getLowestGrade = (teacher: any) => {
      if (!teacher.subjectLoads || teacher.subjectLoads.length === 0) return 999;
      const levels = teacher.subjectLoads.map((load: any) => {
        return gradeLevelMap.get(load.gradeId) ?? gradeNameMap.get(load.gradeId) ?? 999;
      });
      return Math.min(...levels);
    };

    const levelA = getLowestGrade(a);
    const levelB = getLowestGrade(b);

    if (levelA !== levelB) {
      return levelA - levelB; // Sort ascending by grade level
    }
    
    // If they have the same grade level, sort alphabetically by name
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <TeacherManager initialTeachers={sortedTeachers} allDepartments={allDepartments} />
    </div>
  );
}
