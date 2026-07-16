'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createSubject(data: { id: string; name: string; code: string; department: string; type: string; gradeLevels: string }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const existing = await prisma.subject.findUnique({
    where: { id: data.id }
  });

  if (existing) {
    throw new Error('A subject with this ID already exists');
  }

  await prisma.subject.create({
    data
  });

  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function updateSubject(id: string, data: { name: string; code: string; department: string; type: string; gradeLevels: string }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.subject.update({
    where: { id },
    data
  });

  revalidatePath('/admin/subjects');
  return { success: true };
}

export async function deleteSubject(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.subject.delete({
    where: { id }
  });

  revalidatePath('/admin/subjects');
  return { success: true };
}
