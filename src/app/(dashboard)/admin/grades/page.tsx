import { prisma } from '@/lib/prisma';
import GradeManager from '@/components/admin/GradeManager';

export default async function GradeLevelsPage() {
  const grades = await prisma.gradeLevel.findMany({
    orderBy: { level: 'asc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <GradeManager grades={grades} />
    </div>
  );
}
