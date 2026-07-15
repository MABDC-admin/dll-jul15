'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function resubmitDLL(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });

  if (!user?.teacherProfile) {
    throw new Error('Teacher profile not found');
  }

  const logId = formData.get('logId') as string;
  const learningArea = formData.get('learningArea') as string;
  const teachingDateStr = formData.get('teachingDate') as string;
  const topic = formData.get('topic') as string;
  const remarks = formData.get('remarks') as string;

  if (!logId || !learningArea || !teachingDateStr || !topic) {
    throw new Error('Missing required fields');
  }

  const teachingDate = new Date(teachingDateStr);

  // Validate ownership and status
  const existingLog = await prisma.lessonLog.findUnique({
    where: { id: logId }
  });

  if (!existingLog) {
    throw new Error('Lesson log not found');
  }

  if (existingLog.teacherProfileId !== user.teacherProfile.id) {
    throw new Error('Unauthorized: You do not own this DLL');
  }

  if (existingLog.status !== 'For Revision') {
    throw new Error('Only DLLs marked "For Revision" can be resubmitted');
  }

  // Update it back to Pending Review
  await prisma.lessonLog.update({
    where: { id: logId },
    data: {
      learningArea,
      teachingDates: teachingDate.toISOString(),
      submittedDate: new Date(),
      status: 'Pending Review',
      content: JSON.stringify({
        topic,
        remarks: remarks || ''
      }),
      // Clear principal remarks when resubmitting
      remarks: null 
    }
  });

  revalidatePath('/teacher/dll');
  revalidatePath('/principal/dll');
  
  return { success: true };
}
