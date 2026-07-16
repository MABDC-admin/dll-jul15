'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as 'ADMIN' | 'PRINCIPAL' | 'TEACHER';
  const password = formData.get('password') as string; // in a real app, hash this!

  if (!name || !email || !role) {
    throw new Error('Missing fields');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash,
      // Create teacher profile automatically if role is TEACHER
      teacherProfile: role === 'TEACHER' ? {
        create: {
          department: "Unassigned",
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
      } : undefined
    }
  });

  revalidatePath('/admin/users');
  return { success: true };
}
