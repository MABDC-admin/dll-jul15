'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createDepartment, updateDepartment, deleteDepartment } from './actions';
import { Plus, Edit2, Trash2, X, Settings2 } from 'lucide-react';
import Link from 'next/link';

type Department = {
  id: string;
  name: string;
  description: string | null;
};

export default function DepartmentManager({ departments }: { departments: Department[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      if (editingDept) {
        formData.append('id', editingDept.id);
        await updateDepartment(formData);
        toast.success("Department updated successfully");
      } else {
        await createDepartment(formData);
        toast.success("Department created successfully");
      }
      setIsModalOpen(false);
      setEditingDept(null);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      toast.success("Department deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  }

  function openCreateModal() {
    setEditingDept(null);
    setIsModalOpen(true);
  }

  function openEditModal(dept: Department) {
    setEditingDept(dept);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800">Departments Directory</h2>
          <p className="text-sm text-slate-500">Manage school departments and their descriptions.</p>
        </div>
        <button onClick={openCreateModal} className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4">Department Name</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500 italic">No departments found. Create one above.</td>
              </tr>
            ) : (
              departments.map(dept => (
                <tr key={dept.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-bold text-slate-800">{dept.name}</td>
                  <td className="p-4 text-slate-600">{dept.description || '-'}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <Link href={`/principal/departments/${dept.id}`} className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-lg transition flex items-center gap-1">
                      <Settings2 className="w-3.5 h-3.5" /> Manage Loads
                    </Link>
                    <button onClick={() => openEditModal(dept)} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-800">{editingDept ? 'Edit Department' : 'New Department'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1">Department Name</label>
                <input 
                  required 
                  name="name" 
                  defaultValue={editingDept?.name || ''} 
                  type="text" 
                  placeholder="e.g., Mathematics" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
              
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1">Description (Optional)</label>
                <textarea 
                  name="description" 
                  defaultValue={editingDept?.description || ''} 
                  rows={3}
                  placeholder="e.g., Handles all math subjects..." 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition">Cancel</button>
                <button disabled={isPending} type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50">
                  {isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
