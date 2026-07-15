'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createDepartment(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRINCIPAL')) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    throw new Error('Department name is required');
  }

  await prisma.department.create({
    data: {
      name,
      description
    }
  });

  revalidatePath('/admin/departments');
  revalidatePath('/principal/departments');
  revalidatePath('/principal/assignments');
  return { success: true };
}

export async function updateDepartment(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRINCIPAL')) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!id || !name) {
    throw new Error('ID and Name are required');
  }

  await prisma.department.update({
    where: { id },
    data: {
      name,
      description
    }
  });

  revalidatePath('/admin/departments');
  revalidatePath('/principal/departments');
  revalidatePath('/principal/assignments');
  return { success: true };
}

export async function deleteDepartment(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRINCIPAL')) {
    throw new Error('Unauthorized');
  }

  await prisma.department.delete({
    where: { id }
  });

  revalidatePath('/admin/departments');
  revalidatePath('/principal/departments');
  revalidatePath('/principal/assignments');
  return { success: true };
}
