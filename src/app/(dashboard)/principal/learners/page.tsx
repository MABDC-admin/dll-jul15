import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import LearnerManager from '@/components/learners/LearnerManager';

export default async function LearnersDirectoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const learners = await prisma.learner.findMany({
    orderBy: { name: 'asc' }
  });

  const grades = await prisma.gradeLevel.findMany({
    orderBy: { level: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <LearnerManager learners={learners} grades={grades} />
    </div>
  );
}
