'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createTeacherProfile, updateTeacherProfile, deleteTeacherProfile } from '@/app/(dashboard)/principal/teachers/actions';

export default function TeacherManager({ initialTeachers, allDepartments }: { initialTeachers: any[], allDepartments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Unassigned'
  });

  function openNew() {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', department: 'Unassigned' });
    setIsModalOpen(true);
  }

  function openEdit(teacher: any) {
    setEditingId(teacher.user.id);
    setFormData({
      name: teacher.user.name,
      email: teacher.user.email,
      password: '', // Password not required for update
      department: teacher.department || 'Unassigned'
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    const payload = new FormData();
    payload.set('name', formData.name);
    payload.set('email', formData.email);
    payload.set('department', formData.department);
    if (formData.password) {
      payload.set('password', formData.password);
    }

    try {
      if (editingId) {
        await updateTeacherProfile(editingId, payload);
        toast.success("Teacher updated successfully");
      } else {
        await createTeacherProfile(payload);
        toast.success("New teacher added successfully");
      }
      setIsModalOpen(false);
      window.location.reload(); // Quick refresh to grab new data
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you absolutely sure you want to delete this teacher? This will delete their account, their lesson logs, and all subject loads. This action cannot be undone.')) return;
    
    setIsPending(true);
    try {
      await deleteTeacherProfile(userId);
      toast.success("Teacher account deleted");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">Faculty & Instructional Roster</h2>
          <p className="text-xs text-slate-500">Track educators performance, assignments, and manage faculty accounts</p>
        </div>
        <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialTeachers.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition relative group">
            
            {/* CRUD Actions Hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-100 rounded shadow-sm transition">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(t.user.id)} className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-100 rounded shadow-sm transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-3.5">
              <img src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.user.name)}&background=random`} alt={t.user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">{t.user.name}</h4>
                <p className="text-[11px] text-slate-400 font-semibold">{t.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 text-center bg-slate-50 rounded-xl text-[11px]">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Submitted</span>
                <span className="font-bold text-slate-800">{t.totalSubmitted}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Approved</span>
                <span className="font-bold text-emerald-600">{t.approved}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Rate</span>
                <span className="font-bold text-indigo-600">{t.complianceRate}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-500 font-semibold">Grades: <span className="text-slate-800">
                {t.subjectLoads && t.subjectLoads.length > 0 
                  ? Array.from(new Set(t.subjectLoads.map((l: any) => l.gradeId))).join(", ") 
                  : (t.gradeLevels && JSON.parse(t.gradeLevels || '[]').length > 0 ? JSON.parse(t.gradeLevels || '[]').join(", ") : 'Unassigned')}
              </span></p>
              <p className="text-slate-500 font-semibold">Subjects: <span className="text-slate-800">
                {t.subjectLoads && t.subjectLoads.length > 0 
                  ? Array.from(new Set(t.subjectLoads.map((l: any) => l.subjectName))).join(", ") 
                  : (t.subjects && JSON.parse(t.subjects || '[]').length > 0 ? JSON.parse(t.subjects || '[]').join(", ") : 'Unassigned')}
              </span></p>
            </div>

            <Link 
              href={`/principal/teachers/${t.id}`}
              className="block w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-xs font-bold py-2 rounded-lg transition text-center"
            >
              Manage & View Profile
            </Link>
          </div>
        ))}
        {initialTeachers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200 border-dashed">
            No teachers found in the directory.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Modify Teacher' : 'Add New Teacher'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Maria Clara" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. maria@school.edu" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{editingId ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input required={!editingId} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                  <option value="Unassigned">Unassigned</option>
                  {allDepartments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button disabled={isPending} type="submit" className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition">
                  {isPending ? 'Saving...' : (editingId ? 'Update Teacher' : 'Create Teacher')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
