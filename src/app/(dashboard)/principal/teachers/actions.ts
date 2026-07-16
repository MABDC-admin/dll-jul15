'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createTeacherProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const department = formData.get('department') as string;

  if (!name || !email || !password || !department) {
    throw new Error('Missing fields');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      role: 'TEACHER',
      passwordHash,
      teacherProfile: {
        create: {
          department,
          gradeLevels: "[]",
          sections: "[]",
          subjects: "[]",
          schedule: "[]",
          totalSubmitted: 0,
          approved: 0,
          forRevision: 0,
          missing: 0,
          complianceRate: 100,
          status: "Active",
          avatar: ""
        }
      }
    }
  });

  revalidatePath('/principal/teachers');
  return { success: true };
}

export async function updateTeacherProfile(userId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const department = formData.get('department') as string;

  if (!name || !email || !department) {
    throw new Error('Missing fields');
  }

  // Check if email belongs to someone else
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    throw new Error('Email already registered to another user');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      teacherProfile: {
        update: {
          department
        }
      }
    }
  });

  revalidatePath('/principal/teachers');
  return { success: true };
}

export async function deleteTeacherProfile(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  // Deleting the user will cascade delete TeacherProfile due to foreign keys,
  // but Prisma requires explicit deletes if Cascade isn't set up perfectly.
  // We'll delete the profile first to be safe, then the user.
  const profile = await prisma.teacherProfile.findUnique({ where: { userId } });
  
  if (profile) {
    // Delete their subject loads
    await prisma.teacherSubjectLoad.deleteMany({ where: { teacherProfileId: profile.id } });
    // Delete lesson logs
    await prisma.lessonLog.deleteMany({ where: { teacherProfileId: profile.id } });
    // Delete profile
    await prisma.teacherProfile.delete({ where: { id: profile.id } });
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath('/principal/teachers');
  return { success: true };
}
