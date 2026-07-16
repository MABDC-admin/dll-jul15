'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

async function syncTeacherArrays(teacherProfileId: string) {
  // Get all active subject loads for this teacher
  const loads = await prisma.teacherSubjectLoad.findMany({
    where: { teacherProfileId }
  });

  // Extract unique values
  const uniqueGrades = Array.from(new Set(loads.map(l => l.gradeId)));
  const uniqueSections = Array.from(new Set(loads.map(l => l.sectionName)));
  const uniqueSubjects = Array.from(new Set(loads.map(l => l.subjectName)));

  // Update the flat JSON arrays on the TeacherProfile
  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      gradeLevels: JSON.stringify(uniqueGrades),
      sections: JSON.stringify(uniqueSections),
      subjects: JSON.stringify(uniqueSubjects),
    }
  });
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
