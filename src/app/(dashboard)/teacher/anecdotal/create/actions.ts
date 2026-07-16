'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function submitAnecdotal(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });

  if (!user?.teacherProfile) throw new Error('Profile not found');

  const learnerId = formData.get('learnerId') as string;
  const incidentDateStr = formData.get('incidentDate') as string;
  const incidentTimeStr = formData.get('incidentTime') as string;
  const description = formData.get('description') as string;
  const actionTaken = formData.get('actionTaken') as string;
  const recordType = formData.get('recordType') as string;
  const severity = formData.get('severity') as string;
  const incidentType = formData.get('incidentType') as string;

  if (!learnerId || !incidentDateStr || !incidentTimeStr || !description || !actionTaken || !recordType || !severity || !incidentType) {
    throw new Error('All fields are required');
  }

  const incidentDate = new Date(`${incidentDateStr}T${incidentTimeStr}`);

  const record = await prisma.anecdotalRecord.create({
    data: {
      teacherProfileId: user.teacherProfile.id,
      learnerId,
      incidentDate,
      recordType,
      severity,
      incidentType,
      description,
      actionTaken,
      status: 'Pending Review',
    }
  });

  // Notify Principals
  const principals = await prisma.user.findMany({ where: { role: 'PRINCIPAL' } });
  const learner = await prisma.learner.findUnique({ where: { id: learnerId } });

  for (const principal of principals) {
    const notif = await prisma.notification.create({
      data: {
        userId: principal.id,
        message: `${user.name} submitted an anecdotal record for ${learner?.name}.`,
        link: `/principal/anecdotal/${record.id}`
      }
    });

    if ((global as any).io) {
      (global as any).io.to(`USER_${principal.id}`).emit('new-notification', notif);
      (global as any).io.to(`ROLE_PRINCIPAL`).emit('new-notification', notif);
    }
  }

  revalidatePath('/teacher/anecdotal');
  revalidatePath('/principal/anecdotal');

  return { success: true };
}
