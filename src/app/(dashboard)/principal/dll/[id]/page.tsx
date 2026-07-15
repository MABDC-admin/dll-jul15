import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';
import ReviewClient from './ReviewClient';

export default async function DLLDetailedReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    return null;
  }

  const log = await prisma.lessonLog.findUnique({
    where: { id },
    include: {
      teacherProfile: {
        include: { user: true }
      }
    }
  });

  if (!log) {
    notFound();
  }

  const checklist = await prisma.checklistRubric.findMany();

  return <ReviewClient entry={log} checklist={checklist} />;
}
