'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getLearnersForSection, saveAttendance, getAttendanceRecord } from './actions';

interface Grade {
  id: string;
  name: string;
}

export default function AttendanceClient({ gradeLevels }: { gradeLevels: Grade[] }) {
  const [grade, setGrade] = useState(gradeLevels[0]?.id || '');
  const [section, setSection] = useState('Section A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [learners, setLearners] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function loadRoster() {
    if (!grade || !section || !date) return;
    setIsLoading(true);
    try {
      const roster = await getLearnersForSection(grade, section);
      setLearners(roster);
      
      const existingRecords = await getAttendanceRecord(date, grade, section);
      const newAttendanceMap: Record<string, string> = { ...existingRecords };
      
      // Default missing records to Present
      roster.forEach((l: any) => {
        if (!newAttendanceMap[l.id]) newAttendanceMap[l.id] = 'Present';
      });
      
      setAttendance(newAttendanceMap);
      setIsLoaded(true);
      toast.success("Roster loaded.");
    } catch (err) {
      toast.error("Failed to load roster.");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateAttendance(studentId: string, status: string) {
    const newAtt = { ...attendance, [studentId]: status };
    setAttendance(newAtt);
    
    // Auto-save
    try {
      await saveAttendance(date, grade, section, newAtt);
    } catch (err) {
      toast.error("Failed to save record. Check your connection.");
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Standard Daily Learner Attendance Registry</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select handled grade, section, and date to mark physical check-in status. Attendance records are updated securely.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Grade Level</label>
            <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
              {gradeLevels.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Attendance Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
          </div>

          <div className="flex items-end">
            <button disabled={isLoading} onClick={loadRoster} type="button" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-md transition">
              {isLoading ? 'Loading...' : 'Load Class Roster'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            {isLoaded ? `Roster List: ${gradeLevels.find(g => g.id === grade)?.name} - ${section} (${learners.length} Learners)` : 'Select a class roster to begin tracking attendance.'}
          </h4>
        </div>
        
        {!isLoaded ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No learners loaded. Please select a Grade and Section combo above.
          </div>
        ) : learners.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No learners found for this section.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {learners.map((student) => {
              const currentStatus = attendance[student.id] || "Present";

              return (
                <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-800">{student.name}</p>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{student.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Parent: {student.guardian} • Rate: {student.attendance}%</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {[
                      { label: "Present", color: "bg-emerald-600 text-white border-emerald-600", inactive: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                      { label: "Late", color: "bg-amber-500 text-white border-amber-500", inactive: "bg-amber-50 text-amber-500 border-amber-100" },
                      { label: "Absent", color: "bg-rose-600 text-white border-rose-600", inactive: "bg-rose-50 text-rose-600 border-rose-100" }
                    ].map((opt) => {
                      const isSelected = currentStatus === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => updateAttendance(student.id, opt.label)}
                          className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            isSelected ? opt.color : opt.inactive
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
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
