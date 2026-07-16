'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function deleteAnnouncement(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  await prisma.announcement.delete({
    where: { id }
  });

  revalidatePath('/principal/announcements');
  revalidatePath('/teacher');
  revalidatePath('/teacher/announcements');
  
  return { success: true };
}

export async function toggleAnnouncementStatus(id: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  await prisma.announcement.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/principal/announcements');
  revalidatePath('/teacher');
  revalidatePath('/teacher/announcements');

  return { success: true };
}
