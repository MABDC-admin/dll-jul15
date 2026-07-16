'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function dismissAnnouncement(announcementId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });

  if (!user?.teacherProfile) throw new Error('Profile not found');

  // Push the announcementId to the viewedAnnouncements array
  const currentViewed = user.teacherProfile.viewedAnnouncements || [];
  
  if (!currentViewed.includes(announcementId)) {
    await prisma.teacherProfile.update({
      where: { id: user.teacherProfile.id },
      data: {
        viewedAnnouncements: {
          push: announcementId
        }
      }
    });
  }

  revalidatePath('/teacher');
  return { success: true };
}
