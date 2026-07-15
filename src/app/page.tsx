import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role;

  if (role === 'ADMIN') {
    redirect('/admin');
  } else if (role === 'PRINCIPAL') {
    redirect('/principal');
  } else if (role === 'TEACHER') {
    redirect('/teacher');
  } else {
    redirect('/login');
  }
}
