'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function addScheduleBlock(formData: FormData) {
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

  const day = formData.get('day') as string;
  const timeStart = formData.get('timeStart') as string;
  const timeEnd = formData.get('timeEnd') as string;
  const gradeId = formData.get('gradeId') as string;
  const sectionName = formData.get('sectionName') as string;
  const subjectName = formData.get('subjectName') as string;

  if (!day || !timeStart || !timeEnd || !gradeId || !sectionName || !subjectName) {
    throw new Error('Missing required schedule fields');
  }

  await prisma.schedule.create({
    data: {
      teacherProfileId: user.teacherProfile.id,
      day,
      timeStart,
      timeEnd,
      gradeId,
      sectionName,
      subjectName
    }
  });

  revalidatePath('/teacher/schedule');
  return { success: true };
}

export async function removeScheduleBlock(id: string) {
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

  await prisma.schedule.deleteMany({
    where: {
      id,
      teacherProfileId: user.teacherProfile.id
    }
  });

  revalidatePath('/teacher/schedule');
  return { success: true };
}
