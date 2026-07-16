'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function getCalendarEvents(view: 'general' | 'private') {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  if (view === 'general') {
    return prisma.calendarEvent.findMany({
      where: { isGlobal: true },
      orderBy: { startDate: 'asc' }
    });
  } else {
    return prisma.calendarEvent.findMany({
      where: { ownerId: session.user.id, isGlobal: false },
      orderBy: { startDate: 'asc' }
    });
  }
}

export async function createCalendarEvent(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  if (data.isGlobal && session.user.role === 'TEACHER') {
    throw new Error('Teachers cannot create global events');
  }

  const newEvent = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      eventType: data.eventType,
      color: data.color,
      isGlobal: data.isGlobal,
      ownerId: session.user.id
    }
  });

  revalidatePath('/principal/calendar');
  revalidatePath('/teacher/calendar');
  return newEvent;
}

export async function deleteCalendarEvent(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const event = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!event) throw new Error('Not found');

  if (session.user.role === 'TEACHER' && event.ownerId !== session.user.id) {
    throw new Error('Unauthorized to delete this event');
  }

  await prisma.calendarEvent.delete({ where: { id } });
  revalidatePath('/principal/calendar');
  revalidatePath('/teacher/calendar');
  return { success: true };
}
