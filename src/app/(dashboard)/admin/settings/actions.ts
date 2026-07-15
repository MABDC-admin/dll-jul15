'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function updateSystemConfig(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const schoolYear = formData.get('schoolYear') as string;
  const term = formData.get('term') as string;
  const activeFramework = formData.get('activeFramework') as string;

  await prisma.systemConfig.upsert({
    where: { id: "default" },
    update: {
      schoolYear,
      term,
      activeFramework
    },
    create: {
      id: "default",
      schoolYear,
      term,
      activeFramework,
      subscriptionTier: 'Enterprise Local',
      subscriptionStatus: 'ACTIVE',
      renewalDate: '2027-01-01',
      allottedUsers: 100,
      allottedLearners: 5000,
      storageUsed: 0,
      storageAllotted: 100
    }
  });

  revalidatePath('/admin/settings');
  return { success: true };
}
