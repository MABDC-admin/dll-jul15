'use client';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { CheckSquare } from 'lucide-react';
import { SocketProvider } from '@/providers/SocketProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row antialiased relative">
        <Sidebar role={(session?.user as any)?.role || 'TEACHER'} />
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <Header />
          <div className="p-6 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SocketProvider>
  );
}
