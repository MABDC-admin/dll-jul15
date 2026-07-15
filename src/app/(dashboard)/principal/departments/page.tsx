import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DepartmentManager from '@/components/departments/DepartmentManager';

export default async function PrincipalDepartmentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    redirect('/login');
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <DepartmentManager departments={departments} />
    </div>
  );
}
