'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function submitAttendance(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }

  const date = formData.get('date') as string;
  const gradeId = formData.get('gradeId') as string;
  const sectionName = formData.get('sectionName') as string;
  const recordsJson = formData.get('records') as string;

  if (!date || !gradeId || !sectionName || !recordsJson) {
    throw new Error('Missing required fields');
  }

  // Parse the records to ensure it's valid JSON
  let recordsObj;
  try {
    recordsObj = JSON.parse(recordsJson);
  } catch {
    throw new Error('Invalid records data format');
  }

  // Find if a record already exists for this date, grade, and section to upsert
  const existingRecord = await prisma.attendanceRecord.findFirst({
    where: {
      date,
      gradeId,
      sectionName
    }
  });

  if (existingRecord) {
    await prisma.attendanceRecord.update({
      where: { id: existingRecord.id },
      data: { records: recordsJson }
    });
  } else {
    await prisma.attendanceRecord.create({
      data: {
        date,
        gradeId,
        sectionName,
        records: recordsJson
      }
    });
  }

  revalidatePath('/teacher/attendance');
  return { success: true };
}
