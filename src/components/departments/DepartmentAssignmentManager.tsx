'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Edit3, X, UserPlus } from 'lucide-react';
import { updateTeacherAssignment } from '@/app/(dashboard)/principal/assignments/actions';
import { assignTeacherToDepartment } from './actions';
import { getValidSubjectsForGrade } from '@/lib/subject-mapper';
import { safeJsonParse } from '@/lib/utils';

export default function DepartmentAssignmentManager({ 
  teachers, 
  unassignedTeachers,
  allGrades, 
  allSubjects, 
  departmentName 
}: { 
  teachers: any[], 
  unassignedTeachers: any[],
  allGrades: any[], 
  allSubjects: any[], 
  departmentName: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  
  const [checkedGrades, setCheckedGrades] = useState<string[]>([]);
  const [checkedSubjects, setCheckedSubjects] = useState<string[]>([]);
  const [checkedSections, setCheckedSections] = useState<string[]>([]);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  useEffect(() => {
    if (selectedTeacher) {
      if (selectedTeacher.subjectLoads && selectedTeacher.subjectLoads.length > 0) {
        setCheckedGrades(Array.from(new Set(selectedTeacher.subjectLoads.map((l: any) => l.gradeId))));
        setCheckedSubjects(Array.from(new Set(selectedTeacher.subjectLoads.map((l: any) => l.subjectName))));
        setCheckedSections(Array.from(new Set(selectedTeacher.subjectLoads.map((l: any) => l.sectionName))));
      } else {
        try {
          setCheckedGrades(safeJsonParse<string[]>(selectedTeacher.gradeLevels, []));
          setCheckedSubjects(safeJsonParse<string[]>(selectedTeacher.subjects, []));
          setCheckedSections(safeJsonParse<string[]>(selectedTeacher.sections, []));
        } catch {
          setCheckedGrades([]);
          setCheckedSubjects([]);
          setCheckedSections([]);
        }
      }
    } else {
      setCheckedGrades([]);
      setCheckedSubjects([]);
      setCheckedSections([]);
    }
  }, [selectedTeacherId, selectedTeacher]);

  const validSubjects = Array.from(new Set(
    checkedGrades.flatMap(g => getValidSubjectsForGrade(g, allSubjects))
  ));

  const toggleGrade = (gradeName: string) => {
    setCheckedGrades(prev => prev.includes(gradeName) ? prev.filter(g => g !== gradeName) : [...prev, gradeName]);
  };

  const toggleSubject = (subjectName: string) => {
    setCheckedSubjects(prev => prev.includes(subjectName) ? prev.filter(s => s !== subjectName) : [...prev, subjectName]);
  };

  const toggleSection = (sectionName: string) => {
    setCheckedSections(prev => prev.includes(sectionName) ? prev.filter(s => s !== sectionName) : [...prev, sectionName]);
  };

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    formData.set('gradeLevels', checkedGrades.join(', '));
    formData.set('subjects', checkedSubjects.join(', '));
    formData.set('sections', checkedSections.join(', '));
    formData.set('department', departmentName);
    formData.set('teacherProfileId', selectedTeacherId);

    try {
      await updateTeacherAssignment(formData);
      toast.success("Educator load assigned securely.");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update assignment.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleAddTeacher(formData: FormData) {
    setIsPending(true);
    formData.set('teacherProfileId', newTeacherId);
    formData.set('departmentName', departmentName);

    try {
      await assignTeacherToDepartment(formData);
      toast.success("Educator successfully assigned to department.");
      setIsAddOpen(false);
      setNewTeacherId('');
    } catch (err: any) {
      toast.error(err.message || "Failed to assign educator.");
    } finally {
      setIsPending(false);
    }
  }

  function openEdit(teacherId: string) {
    setSelectedTeacherId(teacherId);
    setIsOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-slate-800">Department Faculty</h3>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Educator
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Educator Name</th>
              <th className="p-4">Handling Grades</th>
              <th className="p-4">Handling Sections</th>
              <th className="p-4">Specialized Subjects</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 italic">No educators assigned to this department yet.</td>
              </tr>
            ) : (
              teachers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-bold text-slate-800 flex items-center space-x-2">
                    <img src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.user.name)}&background=random`} alt={t.user.name} className="w-6 h-6 rounded-full" />
                    <span>{t.user.name}</span>
                  </td>
                  <td className="p-4 text-slate-500">
                    <div className="flex flex-wrap gap-1">
                      {((t.subjectLoads && t.subjectLoads.length > 0 ? Array.from(new Set(t.subjectLoads.map((l: any) => l.gradeId))) : safeJsonParse<string[]>(t.gradeLevels, [])) as string[]).map((g: string, i: number) => (
                        <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">
                    <div className="flex flex-wrap gap-1">
                      {((t.subjectLoads && t.subjectLoads.length > 0 ? Array.from(new Set(t.subjectLoads.map((l: any) => l.sectionName))) : safeJsonParse<string[]>(t.sections, [])) as string[]).map((s: string, i: number) => (
                        <span key={i} className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">
                    <div className="flex flex-wrap gap-1">
                      {((t.subjectLoads && t.subjectLoads.length > 0 ? Array.from(new Set(t.subjectLoads.map((l: any) => l.subjectName))) : safeJsonParse<string[]>(t.subjects, [])) as string[]).map((sub: string, i: number) => (
                        <span key={i} className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">{sub}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 flex justify-end">
                    <button onClick={() => openEdit(t.id)} className="px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-lg transition flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Assign Load
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn overflow-y-auto pt-10 pb-10">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Add Educator</h3>
                <p className="text-xs text-slate-500">Assign an educator to {departmentName}</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleAddTeacher} className="space-y-6 text-xs">
              <div>
                <label className="block text-slate-800 font-black mb-2">Select Educator</label>
                {unassignedTeachers.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 italic">
                    All educators are already assigned to this department! 
                    If you need to add someone, make sure they are not already here.
                  </div>
                ) : (
                  <select 
                    required 
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
                  >
                    <option value="" disabled>Choose an educator...</option>
                    {unassignedTeachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.user.name} ({t.department || 'Unassigned'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button disabled={isPending || !newTeacherId} type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50">
                  {isPending ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn overflow-y-auto pt-10 pb-10">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl my-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Assign Teacher Load</h3>
                <p className="text-xs text-slate-500">Updating load for {selectedTeacher?.user?.name}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-800 font-black mb-2">1. Assign Grade Levels</label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {allGrades.map(g => (
                      <label key={g.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition">
                        <input 
                          type="checkbox" 
                          checked={checkedGrades.includes(g.name)}
                          onChange={() => toggleGrade(g.name)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                        />
                        <span className="font-semibold text-slate-700">{g.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-black mb-2">2. Assign Valid Subjects</label>
                  {checkedGrades.length === 0 ? (
                    <div className="text-slate-400 italic p-4 bg-slate-50 rounded-lg border border-slate-200">
                      Select a Grade Level first.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {validSubjects.map((s: any) => (
                        <label key={s.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition">
                          <input 
                            type="checkbox" 
                            checked={checkedSubjects.includes(s.name)}
                            onChange={() => toggleSubject(s.name)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{s.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{s.code}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-slate-800 font-black mb-2">3. Assign Sections</label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {['Section A', 'Section B'].map((sec) => (
                      <label key={sec} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition">
                        <input 
                          type="checkbox" 
                          checked={checkedSections.includes(sec)}
                          onChange={() => toggleSection(sec)}
                          className="w-4 h-4 text-sky-600 rounded border-slate-300"
                        />
                        <span className="font-semibold text-slate-700">{sec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button disabled={isPending} type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50">
                  {isPending ? 'Updating...' : 'Save Matrix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
