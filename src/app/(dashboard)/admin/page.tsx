import { prisma } from '@/lib/prisma';
import { Users, BookMarked, Layers, Settings2, Activity, Cpu } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const usersCount = await prisma.user.count();
  const teachersCount = await prisma.teacherProfile.count();
  const learnersCount = await prisma.learner.count();
  const dllsCount = await prisma.lessonLog.count();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="bg-slate-500/30 text-slate-200 border border-slate-400/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            System Admin Console
          </span>
          <h2 className="text-2xl font-black mt-3 text-white leading-tight">Admin Overview</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Manage institutional data, user roles, system configurations, and subscription status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", val: usersCount, icon: Users },
          { label: "Teacher Profiles", val: teachersCount, icon: BookMarked },
          { label: "Total Learners", val: learnersCount, icon: Layers },
          { label: "DLL Records", val: dllsCount, icon: Activity }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase leading-tight">{c.label}</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Icon className="w-4 h-4" /></span>
              </div>
              <span className="text-xl font-extrabold text-slate-800 mt-2">{c.val}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">System Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Database Engine</span>
              <span className="text-slate-800 font-bold">SQLite (Prisma ORM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Active School Year</span>
              <span className="text-indigo-600 font-bold">2026-2027</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Active Quarter</span>
              <span className="text-indigo-600 font-bold">1st Quarter</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <Settings2 className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/users" className="block text-center py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition">
              Manage Users
            </Link>
            <Link href="/admin/settings" className="block text-center py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition">
              System Config
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
