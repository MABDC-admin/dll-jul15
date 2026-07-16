import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SubjectManager from '@/components/admin/SubjectManager';
import { BookOpen } from 'lucide-react';

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page || '1');
  const search = resolvedSearchParams?.search || '';
  const typeFilter = resolvedSearchParams?.type || '';
  const limit = 50;
  const skip = (page - 1) * limit;

  const whereCondition: any = {};
  if (search) {
    whereCondition.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (typeFilter) {
    whereCondition.type = typeFilter;
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where: whereCondition,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ],
      skip,
      take: limit
    }),
    prisma.subject.count({ where: whereCondition })
  ]);

  const allGrades = await prisma.gradeLevel.findMany({
    orderBy: { level: 'asc' }
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> Standard Subjects
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage the centralized curriculum and its strict Grade Level mappings.</p>
        </div>
      </div>

      <SubjectManager 
        initialSubjects={subjects} 
        allGrades={allGrades}
        currentPage={page}
        totalPages={totalPages}
        searchQuery={search}
        typeFilter={typeFilter}
      />
    </div>
  );
}
