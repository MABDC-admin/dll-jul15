'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function getLearnersForSection(gradeId: string, sectionName: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }
  
  // Fake learner generation since we don't have a Learner model
  return [
    { id: 'LRN-001', name: 'Santos, Juan', guardian: 'Maria Santos', attendance: 95 },
    { id: 'LRN-002', name: 'Reyes, Miguel', guardian: 'Jose Reyes', attendance: 88 },
    { id: 'LRN-003', name: 'Garcia, Maria', guardian: 'Pedro Garcia', attendance: 100 },
    { id: 'LRN-004', name: 'Cruz, Anna', guardian: 'Elena Cruz', attendance: 92 },
    { id: 'LRN-005', name: 'Bautista, Luis', guardian: 'Carmen Bautista', attendance: 85 },
  ];
}

export async function getAttendanceRecord(date: string, gradeId: string, sectionName: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }

  const existingRecord = await prisma.attendanceRecord.findFirst({
    where: { date, gradeId, sectionName }
  });

  if (!existingRecord) return {};
  
  try {
    return JSON.parse(existingRecord.records);
  } catch {
    return {};
  }
}

export async function saveAttendance(date: string, gradeId: string, sectionName: string, recordsMap: Record<string, string>) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    throw new Error('Unauthorized');
  }

  const recordsJson = JSON.stringify(recordsMap);

  const existingRecord = await prisma.attendanceRecord.findFirst({
    where: { date, gradeId, sectionName }
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

  let recordsObj;
  try {
    recordsObj = JSON.parse(recordsJson);
  } catch {
    throw new Error('Invalid records data format');
  }

  const existingRecord = await prisma.attendanceRecord.findFirst({
    where: { date, gradeId, sectionName }
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
