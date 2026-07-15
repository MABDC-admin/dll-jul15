'use client';
import { Award, Bell, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 shadow-sm sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
          <Award className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">MABDC Portal Console</h2>
          <p className="text-xs text-slate-500">
            Active Framework: <span className="font-semibold text-slate-700">DepEd Order No. 016, s. 2026</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden xl:block">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MABDC Operations</span>
          <p className="text-xs font-bold text-slate-800">
            Logged in: {session?.user?.name} ({session?.user?.role})
          </p>
        </div>
      </div>
    </header>
  );
}
