'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { getValidSubjectsForGrade } from '@/lib/subject-mapper';

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

  const gradeLevels = gradeLevelsStr ? gradeLevelsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
  const sections = sectionsStr ? sectionsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
  const subjects = subjectsStr ? subjectsStr.split(',').map(s => s.trim()).filter(Boolean) : [];

  await prisma.teacherProfile.update({
    where: { id: teacherProfileId },
    data: {
      gradeLevels: JSON.stringify(gradeLevels),
      sections: JSON.stringify(sections),
      subjects: JSON.stringify(subjects),
      department: department || ''
    }
  });

  // Automatically generate strict TeacherSubjectLoad records from the selections
  const allSubjects = await prisma.subject.findMany();
  
  // Wipe out existing loads for this teacher to rebuild the matrix
  await prisma.teacherSubjectLoad.deleteMany({
    where: { teacherProfileId }
  });

  const newLoads = [];
  for (const grade of gradeLevels) {
    const validSubjectsForGrade = getValidSubjectsForGrade(grade, allSubjects).map(s => s.name);
    
    for (const subject of subjects) {
      if (validSubjectsForGrade.includes(subject)) {
        for (const section of sections) {
          newLoads.push({
            teacherProfileId,
            gradeId: grade,
            sectionName: section,
            subjectName: subject
          });
        }
      }
    }
  }

  if (newLoads.length > 0) {
    await prisma.teacherSubjectLoad.createMany({
      data: newLoads
    });
  }

  revalidatePath('/principal/assignments');
  revalidatePath('/principal/teachers');
  revalidatePath(`/principal/teachers/${teacherProfileId}`);
  return { success: true };
}
