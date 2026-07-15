'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createLearner(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const gradeId = formData.get('gradeId') as string;
  const gradeSection = formData.get('gradeSection') as string;
  const guardian = formData.get('guardian') as string;
  const contact = formData.get('contact') as string;

  if (!name || !gradeId || !gradeSection) {
    throw new Error('Name, Grade, and Section are required');
  }

  await prisma.learner.create({
    data: {
      name,
      gradeId,
      gradeSection,
      gpa: 0,
      performance: 'Satisfactory',
      attendance: 100,
      guardian: guardian || '',
      contact: contact || '',
      riskLevel: 'Low',
      interventions: '[]'
    }
  });

  revalidatePath('/principal/learners');
  revalidatePath('/teacher/attendance');
  revalidatePath('/teacher/learners');
  return { success: true };
}

export async function updateLearner(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const gradeId = formData.get('gradeId') as string;
  const gradeSection = formData.get('gradeSection') as string;
  const guardian = formData.get('guardian') as string;
  const contact = formData.get('contact') as string;

  if (!id || !name) {
    throw new Error('ID and Name are required');
  }

  await prisma.learner.update({
    where: { id },
    data: {
      name,
      gradeId,
      gradeSection,
      guardian: guardian || '',
      contact: contact || ''
    }
  });

  revalidatePath('/principal/learners');
  revalidatePath('/teacher/attendance');
  revalidatePath('/teacher/learners');
  return { success: true };
}

export async function deleteLearner(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  await prisma.learner.delete({
    where: { id }
  });

  revalidatePath('/principal/learners');
  revalidatePath('/teacher/attendance');
  revalidatePath('/teacher/learners');
  return { success: true };
}
