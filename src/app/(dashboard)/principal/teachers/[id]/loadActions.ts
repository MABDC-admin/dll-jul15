'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

async function syncTeacherArrays(teacherProfileId: string) {
  // Flat arrays are deprecated in favor of strict TeacherSubjectLoad records.
  // We no longer sync unique grades/sections/subjects back into flat JSON strings.
  return;
}

export async function addSubjectLoad(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const teacherProfileId = formData.get('teacherProfileId') as string;
  const gradeId = formData.get('gradeId') as string;
  const sectionName = formData.get('sectionName') as string;
  const subjectName = formData.get('subjectName') as string;

  if (!teacherProfileId || !gradeId || !sectionName || !subjectName) {
    throw new Error('All fields are required');
  }

  // Check if load already exists
  const existing = await prisma.teacherSubjectLoad.findFirst({
    where: {
      teacherProfileId,
      gradeId,
      sectionName,
      subjectName
    }
  });

  if (existing) {
    throw new Error('This subject load is already assigned to this teacher');
  }

  await prisma.teacherSubjectLoad.create({
    data: {
      teacherProfileId,
      gradeId,
      sectionName,
      subjectName
    }
  });

  // Keep legacy flat arrays in sync
  await syncTeacherArrays(teacherProfileId);

  revalidatePath(`/principal/teachers/${teacherProfileId}`);
  revalidatePath('/principal/teachers');
  return { success: true };
}

export async function removeSubjectLoad(loadId: string, teacherProfileId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  await prisma.teacherSubjectLoad.delete({
    where: { id: loadId }
  });

  // Keep legacy flat arrays in sync
  await syncTeacherArrays(teacherProfileId);

  revalidatePath(`/principal/teachers/${teacherProfileId}`);
  revalidatePath('/principal/teachers');
  return { success: true };
}
