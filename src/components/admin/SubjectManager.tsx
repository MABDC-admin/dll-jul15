'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, X, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import { createSubject, updateSubject, deleteSubject } from '@/app/(dashboard)/admin/subjects/actions';
import { useRouter } from 'next/navigation';
import { safeJsonParse } from '@/lib/utils';

export default function SubjectManager({ 
  initialSubjects, 
  allGrades,
  currentPage,
  totalPages,
  searchQuery,
  typeFilter
}: { 
  initialSubjects: any[],
  allGrades: any[],
  currentPage: number,
  totalPages: number,
  searchQuery: string,
  typeFilter: string
}) {
  const router = useRouter();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [search, setSearch] = useState(searchQuery);
  const [type, setType] = useState(typeFilter);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    department: '',
    type: 'CORE',
    gradeLevels: [] as string[]
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (search) url.searchParams.set('search', search);
    else url.searchParams.delete('search');
    
    if (type) url.searchParams.set('type', type);
    else url.searchParams.delete('type');

    url.searchParams.set('page', '1');
    router.push(url.pathname + url.search);
  }

  function toggleGradeSelection(gradeName: string) {
    setFormData(prev => {
      if (prev.gradeLevels.includes(gradeName)) {
        return { ...prev, gradeLevels: prev.gradeLevels.filter(g => g !== gradeName) };
      } else {
        return { ...prev, gradeLevels: [...prev.gradeLevels, gradeName] };
      }
    });
  }

  function openNew() {
    setEditingId(null);
    setFormData({ id: '', name: '', code: '', department: 'dept-elem', type: 'CORE', gradeLevels: [] });
    setIsModalOpen(true);
  }

  function openEdit(subject: any) {
    setEditingId(subject.id);
    setFormData({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      department: subject.department,
      type: subject.type,
      gradeLevels: safeJsonParse<string[]>(subject.gradeLevels, [])
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    
    const payload = {
      ...formData,
      gradeLevels: JSON.stringify(formData.gradeLevels)
    };

    try {
      if (editingId) {
        await updateSubject(editingId, payload);
        toast.success("Subject updated perfectly");
        setSubjects(subjects.map(s => s.id === editingId ? { ...payload } : s));
      } else {
        await createSubject(payload);
        toast.success("New centralized subject added");
        setSubjects([...subjects, payload]);
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you certain you want to permanently delete this subject?')) return;
    setIsPending(true);
    try {
      await deleteSubject(id);
      toast.success("Subject deleted entirely");
      setSubjects(subjects.filter(s => s.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto flex-1">
          <input 
            type="text" 
            placeholder="Search Subject Name or Code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] text-sm px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <select 
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set('type', e.target.value);
              else url.searchParams.delete('type');
              url.searchParams.set('page', '1');
              router.push(url.pathname + url.search);
            }}
            className="text-sm px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Types</option>
            <option value="CORE">CORE</option>
            <option value="APPLIED">APPLIED</option>
            <option value="SPECIALIZED">SPECIALIZED</option>
          </select>
          <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition hover:bg-slate-900">
            Search
          </button>
        </form>
        <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-4 h-4" /> Define Subject
        </button>
      </div>

      {/* Subject List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-wider text-[11px] uppercase">
              <tr>
                <th className="p-4">Subject Name</th>
                <th className="p-4">Code / ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Target Grades</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub) => {
                const grades = safeJsonParse<string[]>(sub.gradeLevels, []);
                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-800">
                      {sub.name}
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub.department}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 text-xs">{sub.code} <span className="text-[10px] ml-1 text-slate-400">({sub.id})</span></td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${
                        sub.type === 'CORE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        sub.type === 'APPLIED' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}>
                        {sub.type}
                      </span>
                    </td>
                    <td className="p-4">
                      {grades.length === 0 ? (
                        <span className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Unmapped</span>
                      ) : (
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {grades.slice(0, 3).map((g: string) => (
                            <span key={g} className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{g}</span>
                          ))}
                          {grades.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{grades.length - 3}</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => openEdit(sub)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500 text-sm">No subjects found matching the criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Modify Centralized Subject' : 'Define New Centralized Subject'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject Unique ID</label>
                  <input required disabled={!!editingId} type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-500" placeholder="e.g. sub-math-1" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Mathematics" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject Code</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. MATH101" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Curriculum Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                    <option value="CORE">CORE</option>
                    <option value="APPLIED">APPLIED</option>
                    <option value="SPECIALIZED">SPECIALIZED</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500">Map to Grade Levels</label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {formData.gradeLevels.length} Selected
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {allGrades.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No Grade Levels defined in the system yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {allGrades.map(grade => {
                        const isSelected = formData.gradeLevels.includes(grade.name);
                        return (
                          <div 
                            key={grade.id} 
                            onClick={() => toggleGradeSelection(grade.name)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                            {grade.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">When checked, this subject will be exclusively available to the Principal for assigning to teachers teaching these specific grades.</p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button disabled={isPending} type="submit" className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition">
                  {isPending ? 'Saving Subject...' : (editingId ? 'Update Centralized Subject' : 'Create Centralized Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
