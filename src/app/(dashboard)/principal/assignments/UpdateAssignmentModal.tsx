'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateTeacherAssignment } from './actions';
import { Plus, X, Edit3 } from 'lucide-react';
import { getValidSubjectsForGrade } from '@/lib/subject-mapper';

export default function UpdateAssignmentModal({ teachers, allGrades, allSubjects, departments }: { teachers: any[], allGrades: any[], allSubjects: any[], departments: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  
  const [checkedGrades, setCheckedGrades] = useState<string[]>([]);
  const [checkedSubjects, setCheckedSubjects] = useState<string[]>([]);
  const [checkedSections, setCheckedSections] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  // Hydrate form when teacher changes
  useEffect(() => {
    if (selectedTeacher) {
      try {
        setCheckedGrades(JSON.parse(selectedTeacher.gradeLevels || '[]'));
        setCheckedSubjects(JSON.parse(selectedTeacher.subjects || '[]'));
        setCheckedSections(JSON.parse(selectedTeacher.sections || '[]'));
        setSelectedDepartment(selectedTeacher.department || '');
      } catch {
        setCheckedGrades([]);
        setCheckedSubjects([]);
        setCheckedSections([]);
      }
    } else {
      setCheckedGrades([]);
      setCheckedSubjects([]);
      setCheckedSections([]);
      setSelectedDepartment('');
    }
  }, [selectedTeacherId, selectedTeacher]);

  // Calculate valid subjects dynamically based on ALL checked grades
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
    // Append the checked arrays as comma separated strings for the action
    formData.set('gradeLevels', checkedGrades.join(', '));
    formData.set('subjects', checkedSubjects.join(', '));
    formData.set('sections', checkedSections.join(', '));
    formData.set('department', selectedDepartment);

    try {
      await updateTeacherAssignment(formData);
      toast.success("Teacher assignments updated securely.");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update assignment.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
        <Edit3 className="w-4 h-4" /> Update Load Assignment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn overflow-y-auto pt-10 pb-10">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl my-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">Update Load Assignment</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-6 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Select Teacher</label>
                <select 
                  required 
                  name="teacherProfileId" 
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="" disabled>Select a teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user.name} ({t.user.email})</option>
                  ))}
                </select>
              </div>

              {selectedTeacherId && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Select Department</label>
                      <select 
                        name="department" 
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      >
                        <option value="">No Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-4">
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
                        Select a Grade Level first to view valid subjects.
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
                </>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button disabled={isPending || !selectedTeacherId} type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50">
                  {isPending ? 'Updating...' : 'Save Assignment Matrix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
