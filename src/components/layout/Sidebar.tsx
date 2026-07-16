'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  FileCheck, 
  Users, 
  GraduationCap, 
  Settings, 
  Shield, 
  Cpu, 
  UserCheck, 
  Layers, 
  BookMarked, 
  Settings2,
  ClipboardList,
  CalendarDays,
  FilePlus2,
  FileText,
  Award,
  LogOut,
  AlertTriangle,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

import { useSocket } from '@/providers/SocketProvider';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  badge?: number;
}

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { unreadCount } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAnecdotalCount, setPendingAnecdotalCount] = useState(0);

  useEffect(() => {
    if (role === 'PRINCIPAL') {
      fetch('/api/anecdotal-count')
        .then(res => res.json())
        .then(data => setPendingAnecdotalCount(data.count || 0))
        .catch(() => {});
    }
  }, [role]);

  const navItems: Record<string, SidebarItem[]> = {
    ADMIN: [
      { id: 'adminDashboard', label: 'Admin Overview', href: '/admin', icon: Cpu },
      { id: 'userManagement', label: 'User Control', href: '/admin/users', icon: UserCheck },
      { id: 'gradeManagement', label: 'Grade Levels', href: '/admin/grades', icon: Layers },
      { id: 'subjectManagement', label: 'Standard Subjects', href: '/admin/subjects', icon: BookMarked },
      { id: 'deptManagement', label: 'Departments', href: '/admin/departments', icon: Layers },
      { id: 'sySubscription', label: 'S.Y. & Subscription', href: '/admin/settings', icon: Settings2 },
      { id: 'checklistSettings', label: 'Checklist Rubrics', href: '/admin/checklists', icon: FileCheck }
    ],
    PRINCIPAL: [
      { id: 'dashboard', label: 'Dashboard', href: '/principal', icon: BookOpen },
      { id: 'tracker', label: 'Weekly Tracker', href: '/principal/tracker', icon: ClipboardList },
      { id: 'ddlReview', label: 'DDL Review', href: '/principal/dll', icon: FileCheck },
      { id: 'anecdotalReview', label: 'Anecdotal Review', href: '/principal/anecdotal', icon: AlertTriangle, badge: pendingAnecdotalCount },
      { id: 'calendar', label: 'School Calendar', href: '/principal/calendar', icon: CalendarDays },
      { id: 'announcements', label: 'Announcements', href: '/principal/announcements', icon: Bell },
      { id: 'teachers', label: 'Teachers Directory', href: '/principal/teachers', icon: Users },
      { id: 'learners', label: 'Learner\'s Directory', href: '/principal/learners', icon: GraduationCap },
      { id: 'deptManagement', label: 'Departments & Load', href: '/principal/departments', icon: Layers },
      { id: 'audit', label: 'Audit Trail Log', href: '/principal/audit', icon: Shield }
    ],
    TEACHER: [
      { id: 'teacherDashboard', label: 'My Dashboard', href: '/teacher', icon: BookOpen },
      { id: 'teacherLoad', label: 'My Subject Load', href: '/teacher/load', icon: BookMarked },
      { id: 'attendance', label: 'Daily Attendance Log', href: '/teacher/attendance', icon: ClipboardList },
      { id: 'learners', label: 'My Learners List', href: '/teacher/learners', icon: GraduationCap },
      { id: 'calendar', label: 'School Calendar', href: '/teacher/calendar', icon: CalendarDays },
      { id: 'scheduleBuilder', label: 'Class Schedules', href: '/teacher/schedule', icon: CalendarDays },
      { id: 'dllCreator', label: 'Create / Submit DLL', href: '/teacher/dll/create', icon: FilePlus2 },
      { id: 'mySubmissions', label: 'My Submissions', href: '/teacher/dll', icon: FileText },
      { id: 'anecdotal', label: 'Anecdotal Records', href: '/teacher/anecdotal', icon: ClipboardList },
      { id: 'announcements', label: 'Announcements', href: '/teacher/announcements', icon: Bell }
    ],
  };

  const items = navItems[role] || [];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 md:h-screen md:sticky md:top-0 z-20">
      <div className="p-4 md:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg animate-pulse">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white uppercase leading-none">MABDC</h1>
            <span className="text-[10px] text-indigo-400 font-medium">Operations Center</span>
          </div>
        </div>
        <button 
          className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 overflow-hidden`}>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname ? (pathname === item.href || (pathname.startsWith(item.href) && item.href.length > 8)) : false;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
          <span>S.Y. 2026-2027</span>
          <span className="font-semibold text-indigo-400">1st Quarter</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
      </div>
    </aside>
  );
}
