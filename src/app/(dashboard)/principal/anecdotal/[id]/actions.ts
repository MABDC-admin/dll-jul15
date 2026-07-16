'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function resolveAnecdotal(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const recordId = formData.get('recordId') as string;
  const resolution = formData.get('resolution') as string;

  if (!recordId || !resolution) {
    throw new Error('Resolution is required');
  }

  const record = await prisma.anecdotalRecord.update({
    where: { id: recordId },
    data: {
      status: 'Resolved',
      principalResolution: resolution,
      resolvedBy: session.user.name,
      resolvedDate: new Date(),
    },
    include: {
      teacherProfile: { include: { user: true } },
      learner: true
    }
  });

  // Notify Teacher
  const notif = await prisma.notification.create({
    data: {
      userId: record.teacherProfile.user.id,
      message: `Principal resolved your anecdotal report for ${record.learner.name}.`,
      link: `/teacher/anecdotal`
    }
  });

  if ((global as any).io) {
    (global as any).io.to(`USER_${record.teacherProfile.user.id}`).emit('new-notification', notif);
  }

  revalidatePath('/principal/anecdotal');
  revalidatePath('/teacher/anecdotal');

  return { success: true };
}
