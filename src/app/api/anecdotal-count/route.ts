import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ count: 0 });
  }

  const role = (session.user as any).role;

  if (role === 'PRINCIPAL') {
    const count = await prisma.anecdotalRecord.count({
      where: { status: 'Pending Review' }
    });
    return NextResponse.json({ count });
  }

  return NextResponse.json({ count: 0 });
}
