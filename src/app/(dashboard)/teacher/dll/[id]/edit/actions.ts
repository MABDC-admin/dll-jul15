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
  const teachingDate = formData.get('teachingDate') as string;
  const topic = formData.get('topic') as string;
  const remarks = formData.get('remarks') as string;
  const term = formData.get('term') as string;
  const weekNumber = formData.get('weekNumber') as string;

  if (!logId || !learningArea || !teachingDate || !topic || !term || !weekNumber) {
    throw new Error("Missing required fields");
  }

  const content = JSON.stringify({
    topic,
    remarks
  });

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
      teachingDates: new Date(teachingDate).toISOString(),
      term,
      weekNumber,
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

  // Notify Principals concurrently
  const principals = await prisma.user.findMany({ where: { role: 'PRINCIPAL' } });
  await Promise.all(principals.map(async (principal) => {
    const notif = await prisma.notification.create({
      data: {
        userId: principal.id,
        message: `${user.name} resubmitted a revised Lesson Log for ${learningArea}.`,
        link: `/principal/dll/${logId}`
      }
    });
    if ((global as any).io) {
      (global as any).io.to(`USER_${principal.id}`).emit('new-notification', notif);
      (global as any).io.to(`ROLE_PRINCIPAL`).emit('new-notification', notif);
    }
  }));

  revalidatePath('/teacher/dll');
  revalidatePath('/principal/dll');
  revalidatePath('/principal');
  
  return { success: true };
}
