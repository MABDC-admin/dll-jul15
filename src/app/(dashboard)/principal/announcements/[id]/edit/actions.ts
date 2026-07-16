'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function updateAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const mediaUrl = formData.get('mediaUrl') as string;
  const mediaType = formData.get('mediaType') as string;
  const isActiveStr = formData.get('isActive') as string;
  const publishAtStr = formData.get('publishAt') as string;

  if (!id || !title || !content) {
    throw new Error('Missing required fields');
  }

  const isActive = isActiveStr === 'true';
  const publishAt = publishAtStr ? new Date(publishAtStr) : new Date();

  await prisma.announcement.update({
    where: { id },
    data: {
      title,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      isActive,
      publishAt,
    }
  });

  revalidatePath('/principal/announcements');
  revalidatePath('/teacher');
  revalidatePath('/teacher/announcements');

  return { success: true };
}
