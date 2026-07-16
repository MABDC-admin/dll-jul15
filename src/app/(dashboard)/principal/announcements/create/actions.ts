'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const mediaUrl = formData.get('mediaUrl') as string;
  const mediaType = formData.get('mediaType') as string;
  const publishAtStr = formData.get('publishAt') as string;

  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  const publishAt = publishAtStr ? new Date(publishAtStr) : new Date();

  await prisma.announcement.create({
    data: {
      title,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      isActive: true,
      publishAt,
    }
  });

  revalidatePath('/principal/announcements');
  revalidatePath('/teacher');

  return { success: true };
}
