'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function addTeacherScheduleBlock(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const teacherProfileId = formData.get('teacherProfileId') as string;
  const day = formData.get('day') as string;
  const timeStart = formData.get('timeStart') as string;
  const timeEnd = formData.get('timeEnd') as string;
  const gradeId = formData.get('gradeId') as string;
  const sectionName = formData.get('sectionName') as string;
  const subjectName = formData.get('subjectName') as string;

  if (!teacherProfileId || !day || !timeStart || !timeEnd || !gradeId || !sectionName || !subjectName) {
    throw new Error('Missing required schedule fields');
  }

  await prisma.schedule.create({
    data: {
      teacherProfileId,
      day,
      timeStart,
      timeEnd,
      gradeId,
      sectionName,
      subjectName
    }
  });

  revalidatePath(`/principal/teachers/${teacherProfileId}`);
  return { success: true };
}

export async function removeTeacherScheduleBlock(id: string, teacherProfileId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  await prisma.schedule.deleteMany({
    where: {
      id,
      teacherProfileId
    }
  });

  revalidatePath(`/principal/teachers/${teacherProfileId}`);
  return { success: true };
}

export async function updateTeacherAvatar(teacherProfileId: string, avatarUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: { avatar: avatarUrl }
  });

  revalidatePath(`/principal/teachers/${teacherProfileId}`);
  revalidatePath('/principal/teachers');
  return { success: true };
}
