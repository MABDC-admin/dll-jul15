import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import EditDLLForm from './EditDLLForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditDLLPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });

  if (!user?.teacherProfile) {
    redirect('/login');
  }

  const log = await prisma.lessonLog.findUnique({
    where: { id }
  });

  if (!log) {
    notFound();
  }

  // Ensure they own it and it is actually For Revision
  if (log.teacherProfileId !== user.teacherProfile.id || log.status !== 'For Revision') {
    redirect('/teacher/dll');
  }

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <div>
        <Link href="/teacher/dll" className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to DLL Library
        </Link>
        <h2 className="text-2xl font-black text-slate-800">Revise Daily Lesson Log</h2>
        <p className="text-sm text-slate-500 mt-1">Update your instructional design based on Academic Director feedback.</p>
      </div>
      
      <EditDLLForm log={log} />
    </div>
  );
}
