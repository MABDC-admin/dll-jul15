'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function updateTeacherAssignment(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const teacherProfileId = formData.get('teacherProfileId') as string;
  const gradeLevelsStr = formData.get('gradeLevels') as string;
  const sectionsStr = formData.get('sections') as string;
  const subjectsStr = formData.get('subjects') as string;
  const department = formData.get('department') as string;
  
  if (!teacherProfileId) {
    throw new Error('Teacher Profile ID is required');
  }

  const gradeLevels = gradeLevelsStr ? gradeLevelsStr.split(',').map(s => s.trim()) : [];
  const sections = sectionsStr ? sectionsStr.split(',').map(s => s.trim()) : [];
  const subjects = subjectsStr ? subjectsStr.split(',').map(s => s.trim()) : [];

  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      gradeLevels: JSON.stringify(gradeLevels),
      sections: JSON.stringify(sections),
      subjects: JSON.stringify(subjects),
      department: department || ''
    }
  });

  revalidatePath('/principal/assignments');
  return { success: true };
}
