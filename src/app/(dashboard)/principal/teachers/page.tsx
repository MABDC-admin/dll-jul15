import { prisma } from '@/lib/prisma';
import { cachedQuery } from '@/lib/cache';
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
    cachedQuery('allGrades', () => prisma.gradeLevel.findMany({
      orderBy: { level: 'asc' }
    }), 120000)
  ]);

  // Create a map of gradeId -> level for fast lookup
  const gradeLevelMap = new Map(allGrades.map(g => [g.id, g.level]));
  // Fallback map just in case subjectLoads uses the name instead of id
  const gradeNameMap = new Map(allGrades.map(g => [g.name, g.level]));

  // Sort teachers by Department first, then Grade Level, then alphabetically
  const deptOrder: Record<string, number> = {
    'Pre-School Department': 1,
    'Elementary Department': 2,
    'Junior High School Department': 3,
    'Senior High School Department': 4,
  };

  const sortedTeachers = teachers.sort((a, b) => {
    // 1. Sort by Department
    const rankA = deptOrder[a.department] || 99;
    const rankB = deptOrder[b.department] || 99;
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // 2. Sort by Lowest Grade Level
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
      return levelA - levelB;
    }
    
    // 3. Sort alphabetically by name
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <TeacherManager initialTeachers={sortedTeachers} allDepartments={allDepartments} />
    </div>
  );
}
