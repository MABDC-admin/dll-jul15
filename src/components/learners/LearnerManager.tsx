'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createLearner, updateLearner, deleteLearner } from './actions';
import { Plus, Edit2, Trash2, X, Search, User, ShieldAlert } from 'lucide-react';

type Learner = {
  id: string;
  name: string;
  gradeId: string;
  gradeSection: string;
  gpa: number;
  attendance: number;
  guardian: string;
  contact: string;
  riskLevel: string;
};

export default function LearnerManager({ learners, grades }: { learners: Learner[], grades: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<Learner | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLearners = learners.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.gradeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.gradeSection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      if (editingLearner) {
        formData.append('id', editingLearner.id);
        await updateLearner(formData);
        toast.success("Learner updated successfully");
      } else {
        await createLearner(formData);
        toast.success("Learner enrolled successfully");
      }
      setIsModalOpen(false);
      setEditingLearner(null);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this learner? This will also remove their attendance records.')) return;
    try {
      await deleteLearner(id);
      toast.success("Learner removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    }
  }

  function openCreateModal() {
    setEditingLearner(null);
    setIsModalOpen(true);
  }

  function openEditModal(learner: Learner) {
    setEditingLearner(learner);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Learner Directory</h2>
          <p className="text-sm text-slate-500 font-medium">Manage student records, assignments, and structural compliance.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search learners..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition"
            />
          </div>
          <button onClick={openCreateModal} className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Learner
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class assignment</th>
                <th className="p-4 text-center">GPA / Perf</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4">Guardian Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium italic">No learners found.</td>
                </tr>
              ) : (
                filteredLearners.map(learner => (
                  <tr key={learner.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {learner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{learner.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{learner.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{learner.gradeId}</span>
                        <span className="text-xs text-slate-500">{learner.gradeSection}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-700">{learner.gpa.toFixed(1)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${learner.attendance >= 90 ? 'bg-emerald-100 text-emerald-700' : learner.attendance >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {learner.attendance}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 text-xs">{learner.guardian || '-'}</span>
                        <span className="text-xs text-slate-400">{learner.contact || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => openEditModal(learner)} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(learner.id)} className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto pt-20 pb-20">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800">{editingLearner ? 'Edit Learner' : 'Enroll New Learner'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Full Name</label>
                <input 
                  required 
                  name="name" 
                  defaultValue={editingLearner?.name || ''} 
                  type="text" 
                  placeholder="e.g., Juan Dela Cruz" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Grade Level</label>
                  <select 
                    required 
                    name="gradeId" 
                    defaultValue={editingLearner?.gradeId || ''} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium text-sm transition"
                  >
                    <option value="" disabled>Select...</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Section</label>
                  <select 
                    required 
                    name="gradeSection" 
                    defaultValue={editingLearner?.gradeSection || ''} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium text-sm transition"
                  >
                    <option value="" disabled>Select...</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Guardian Name</label>
                  <input 
                    name="guardian" 
                    defaultValue={editingLearner?.guardian || ''} 
                    type="text" 
                    placeholder="Parent/Guardian Name" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-1">Contact Number</label>
                  <input 
                    name="contact" 
                    defaultValue={editingLearner?.contact || ''} 
                    type="text" 
                    placeholder="09..." 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-medium text-sm transition"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm">Cancel</button>
                <button disabled={isPending} type="submit" className="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50 text-sm shadow-sm">
                  {isPending ? 'Saving...' : (editingLearner ? 'Save Changes' : 'Enroll Learner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
