'use client';

import { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { addSectionToGrade, removeSectionFromGrade, addSubjectToGrade, removeSubjectFromGrade } from '@/app/(dashboard)/admin/grades/actions';

export default function GradeManager({ grades }: { grades: any[] }) {
  const [expandedGradeId, setExpandedGradeId] = useState<string | null>(null);
  const [newSection, setNewSection] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleAddSection(gradeId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!newSection.trim()) return;

    setIsPending(true);
    try {
      await addSectionToGrade(gradeId, newSection.trim());
      toast.success("Section added to Grade Level");
      setNewSection('');
    } catch (err: any) {
      toast.error(err.message || "Failed to add section");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemoveSection(gradeId: string, sectionName: string) {
    if (!confirm(`Are you sure you want to remove section "${sectionName}"?`)) return;
    
    try {
      await removeSectionFromGrade(gradeId, sectionName);
      toast.success("Section removed from Grade Level");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove section");
    }
  }

  async function handleAddSubject(gradeId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim()) return;

    setIsPending(true);
    try {
      await addSubjectToGrade(gradeId, newSubject.trim());
      toast.success("Subject added to Grade Level");
      setNewSubject('');
    } catch (err: any) {
      toast.error(err.message || "Failed to add subject");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemoveSubject(gradeId: string, subjectName: string) {
    if (!confirm(`Are you sure you want to remove subject "${subjectName}"?`)) return;
    
    try {
      await removeSubjectFromGrade(gradeId, subjectName);
      toast.success("Subject removed from Grade Level");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove subject");
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Grade Level Configurations</h3>
            <p className="text-xs text-slate-400">Map active school structural levels and manage their designated sections and subjects.</p>
          </div>
        </div>
        <button className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Grade Level
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grades.map((g) => {
          const sections = JSON.parse(g.sections || '[]');
          const subjects = JSON.parse(g.subjects || '[]');
          const isExpanded = expandedGradeId === g.id;

          return (
            <div key={g.id} className={`border border-slate-200 rounded-xl space-y-0 overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-indigo-50/30' : 'bg-slate-50'}`}>
              
              <div 
                className="p-4 flex justify-between items-start cursor-pointer hover:bg-slate-100/50 transition"
                onClick={() => setExpandedGradeId(isExpanded ? null : g.id)}
              >
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{g.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{g.keyStage}</p>
                  
                  <div className="pt-2 flex items-center space-x-2 text-xs flex-wrap gap-y-2">
                    <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-semibold shadow-sm">
                      Level: {g.level}
                    </span>
                    <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-semibold shadow-sm">
                      Sections: {sections.length}
                    </span>
                    <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-semibold shadow-sm">
                      Subjects: {subjects.length}
                    </span>
                  </div>
                </div>
                <button className="p-1 text-slate-400 hover:text-indigo-600 bg-white rounded shadow-sm border border-slate-200 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-slate-200 bg-white space-y-6 animate-fadeIn">
                  
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Manage Sections</h5>
                    <ul className="space-y-2">
                      {sections.map((section: string) => (
                        <li key={section} className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-sm text-slate-700 font-bold">
                          {section}
                          <button 
                            onClick={() => handleRemoveSection(g.id, section)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                      {sections.length === 0 && (
                        <li className="text-xs text-slate-400 italic text-center py-2">No sections defined.</li>
                      )}
                    </ul>

                    <form onSubmit={(e) => handleAddSection(g.id, e)} className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="New Section Name (e.g. Apollo)" 
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button 
                        type="submit" 
                        disabled={!newSection.trim() || isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Manage Subjects</h5>
                    <ul className="space-y-2">
                      {subjects.map((subject: string) => (
                        <li key={subject} className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-sm text-slate-700 font-bold">
                          {subject}
                          <button 
                            onClick={() => handleRemoveSubject(g.id, subject)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                      {subjects.length === 0 && (
                        <li className="text-xs text-slate-400 italic text-center py-2">No subjects defined.</li>
                      )}
                    </ul>

                    <form onSubmit={(e) => handleAddSubject(g.id, e)} className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="New Subject (e.g. Mathematics)" 
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button 
                        type="submit" 
                        disabled={!newSubject.trim() || isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </div>
          );
        })}
        {grades.length === 0 && (
          <div className="col-span-3 text-center py-10 text-slate-500 text-sm">
            No Grade Levels configured.
          </div>
        )}
      </div>
    </div>
  );
}
