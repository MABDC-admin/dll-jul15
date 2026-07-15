'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function submitDLL(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });

  if (!user || !user.teacherProfile) {
    throw new Error('Teacher Profile not found');
  }

  const date = formData.get('date') as string;
  const subject = formData.get('subject') as string;
  const topic = formData.get('topic') as string;
  const remarks = formData.get('remarks') as string;

  if (!date || !subject || !topic) {
    throw new Error('Missing required fields');
  }

  const content = JSON.stringify({
    topic,
    remarks
  });

  await prisma.lessonLog.create({
    data: {
      teacherProfileId: user.teacherProfile.id,
      learningArea: subject,
      teachingDates: date,
      status: 'Pending Review',
      originalFilename: 'Online Submission',
      fileVersion: '1.0',
      schoolYear: '2026-2027',
      term: '1st Quarter',
      weekNumber: '1',
      timeliness: 'On-time',
      remarks: remarks || "",
      content
    }
  });

  await prisma.teacherProfile.update({
    where: { id: user.teacherProfile.id },
    data: { totalSubmitted: { increment: 1 } }
  });

  revalidatePath('/principal/dll');
  revalidatePath('/teacher/dll');
  revalidatePath('/teacher');

  return { success: true };
}
