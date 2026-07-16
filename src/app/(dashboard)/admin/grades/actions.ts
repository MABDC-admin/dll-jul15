'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { safeJsonParse } from '@/lib/utils';

export async function addSectionToGrade(gradeId: string, sectionName: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const grade = await prisma.gradeLevel.findUnique({ where: { id: gradeId } });
  if (!grade) throw new Error('Grade level not found');

  const currentSections = safeJsonParse<string[]>(grade.sections, []);
  if (currentSections.includes(sectionName)) {
    throw new Error('Section already exists in this grade level');
  }

  currentSections.push(sectionName);

  await prisma.gradeLevel.update({
    where: { id: gradeId },
    data: { 
      sections: JSON.stringify(currentSections),
      count: currentSections.length
    }
  });

  revalidatePath('/admin/grades');
  return { success: true };
}

export async function removeSectionFromGrade(gradeId: string, sectionName: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const grade = await prisma.gradeLevel.findUnique({ where: { id: gradeId } });
  if (!grade) throw new Error('Grade level not found');

  let currentSections = safeJsonParse<string[]>(grade.sections, []);
  currentSections = currentSections.filter((s: string) => s !== sectionName);

  await prisma.gradeLevel.update({
    where: { id: gradeId },
    data: { 
      sections: JSON.stringify(currentSections),
      count: currentSections.length
    }
  });

  revalidatePath('/admin/grades');
  return { success: true };
}

export async function addSubjectToGrade(gradeId: string, subjectName: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const grade = await prisma.gradeLevel.findUnique({ where: { id: gradeId } });
  if (!grade) throw new Error('Grade level not found');

  const currentSubjects = safeJsonParse<string[]>(grade.subjects, []);
  if (currentSubjects.includes(subjectName)) {
    throw new Error('Subject already exists in this grade level');
  }

  currentSubjects.push(subjectName);

  await prisma.gradeLevel.update({
    where: { id: gradeId },
    data: { subjects: JSON.stringify(currentSubjects) }
  });

  revalidatePath('/admin/grades');
  return { success: true };
}

export async function removeSubjectFromGrade(gradeId: string, subjectName: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') throw new Error('Unauthorized');

  const grade = await prisma.gradeLevel.findUnique({ where: { id: gradeId } });
  if (!grade) throw new Error('Grade level not found');

  let currentSubjects = safeJsonParse<string[]>(grade.subjects, []);
  currentSubjects = currentSubjects.filter((s: string) => s !== subjectName);

  await prisma.gradeLevel.update({
    where: { id: gradeId },
    data: { subjects: JSON.stringify(currentSubjects) }
  });

  revalidatePath('/admin/grades');
  return { success: true };
}

