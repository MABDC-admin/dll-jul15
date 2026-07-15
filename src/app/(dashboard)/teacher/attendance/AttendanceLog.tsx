'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { submitAttendance } from './actions';
import { Calendar, Save, CheckCircle2, XCircle, Clock } from 'lucide-react';

type Learner = {
  id: string;
  name: string;
  gradeId: string;
  gradeSection: string;
};

type AttendanceRecord = {
  id: string;
  date: string;
  gradeId: string;
  sectionName: string;
  records: string; // JSON { [studentId]: "Present" | "Late" | "Absent" }
};

export default function AttendanceLog({
  assignedGrades,
  assignedSections,
  learners,
  existingRecords
}: {
  assignedGrades: string[],
  assignedSections: string[],
  learners: Learner[],
  existingRecords: AttendanceRecord[]
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState(assignedGrades[0] || '');
  const [selectedSection, setSelectedSection] = useState(assignedSections[0] || '');
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);

  const currentClassLearners = learners.filter(l => l.gradeId === selectedGrade && l.gradeSection === selectedSection);
  
  // Load existing records when date, grade, or section changes
  useEffect(() => {
    const record = existingRecords.find(r => r.date === selectedDate && r.gradeId === selectedGrade && r.sectionName === selectedSection);
    if (record) {
      try {
        setAttendance(JSON.parse(record.records));
      } catch {
        setAttendance({});
      }
    } else {
      // Default all to Present if no record exists
      const initial: Record<string, string> = {};
      currentClassLearners.forEach(l => {
        initial[l.id] = 'Present';
      });
      setAttendance(initial);
    }
  }, [selectedDate, selectedGrade, selectedSection, existingRecords, currentClassLearners.length]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  async function handleSave() {
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append('date', selectedDate);
      formData.append('gradeId', selectedGrade);
      formData.append('sectionName', selectedSection);
      formData.append('records', JSON.stringify(attendance));
      
      await submitAttendance(formData);
      toast.success("Attendance saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save attendance");
    } finally {
      setIsPending(false);
    }
  }

  if (!assignedGrades.length || !assignedSections.length) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold animate-fadeIn">
        You do not have any grades or sections assigned. You cannot take attendance.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-semibold text-slate-700"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 mb-1">Grade Level</label>
          <select 
            value={selectedGrade} 
            onChange={e => setSelectedGrade(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-semibold text-slate-700"
          >
            {assignedGrades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
          <select 
            value={selectedSection} 
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-semibold text-slate-700"
          >
            {assignedSections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Class Roster: {currentClassLearners.length} Students</h3>
          <button 
            onClick={handleSave} 
            disabled={isPending || currentClassLearners.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
        
        {currentClassLearners.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 font-medium">No learners found in this class.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentClassLearners.map(learner => {
              const status = attendance[learner.id] || 'Present';
              
              return (
                <div key={learner.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {learner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{learner.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">LRN: {learner.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => handleStatusChange(learner.id, 'Present')}
                      className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${status === 'Present' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                    </button>
                    <button 
                      onClick={() => handleStatusChange(learner.id, 'Late')}
                      className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${status === 'Late' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Late
                    </button>
                    <button 
                      onClick={() => handleStatusChange(learner.id, 'Absent')}
                      className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${status === 'Absent' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
