'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function reviewLessonLog(id: string, action: 'Approve' | 'Revise', remarks: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    throw new Error('Unauthorized');
  }

  const log = await prisma.lessonLog.findUnique({ where: { id }, include: { teacherProfile: true } });
  if (!log) throw new Error('Lesson Log not found');

  const status = action === 'Approve' ? 'Approved' : 'For Revision';

  await prisma.lessonLog.update({
    where: { id },
    data: {
      status,
      remarks,
      approvedBy: session.user.name,
      approvedDate: new Date()
    }
  });

  // Update teacher stats
  if (status === 'Approved' && log.status !== 'Approved') {
    await prisma.teacherProfile.update({
      where: { id: log.teacherProfileId },
      data: { 
        approved: { increment: 1 },
        forRevision: log.status === 'For Revision' ? { decrement: 1 } : undefined
      }
    });
  } else if (status === 'For Revision' && log.status !== 'For Revision') {
    await prisma.teacherProfile.update({
      where: { id: log.teacherProfileId },
      data: { 
        forRevision: { increment: 1 },
        approved: log.status === 'Approved' ? { decrement: 1 } : undefined
      }
    });
  }

  // Recalculate compliance rate
  const updatedTeacher = await prisma.teacherProfile.findUnique({ where: { id: log.teacherProfileId } });
  if (updatedTeacher && updatedTeacher.totalSubmitted > 0) {
    const complianceRate = (updatedTeacher.approved / updatedTeacher.totalSubmitted) * 100;
    await prisma.teacherProfile.update({
      where: { id: log.teacherProfileId },
      data: { complianceRate }
    });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      user: session.user.name || "Principal",
      action: `Reviewed DLL ${id.slice(0, 8)} (${status})`,
      type: "review"
    }
  });

  // Notify Teacher
  const notif = await prisma.notification.create({
    data: {
      userId: log.teacherProfile.userId,
      message: `Your Lesson Log for ${log.learningArea} was marked as "${status}".`,
      link: status === 'For Revision' ? `/teacher/dll/${id}/edit` : `/teacher/dll`
    }
  });

  if ((global as any).io) {
    (global as any).io.to(`USER_${log.teacherProfile.userId}`).emit('new-notification', notif);
  }

  revalidatePath('/principal/dll');
  revalidatePath(`/principal/dll/${id}`);
  
  return { success: true };
}
