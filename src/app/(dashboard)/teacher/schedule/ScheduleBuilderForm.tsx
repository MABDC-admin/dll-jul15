'use client';

import { toast } from 'sonner';
import { addScheduleBlock } from './actions';
import { useState, useEffect } from 'react';
import { getValidSubjectsForGrade } from '@/lib/subject-mapper';

interface Grade {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  gradeLevels: string;
}

export default function ScheduleBuilderForm({ grades, subjects }: { grades: Grade[], subjects: Subject[] }) {
  const [isPending, setIsPending] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState('');

  // Default to first grade on load
  useEffect(() => {
    if (grades.length > 0 && !selectedGradeId) {
      setSelectedGradeId(grades[0].id);
    }
  }, [grades]);

  const selectedGrade = grades.find(g => g.id === selectedGradeId);
  const validSubjects = selectedGrade ? getValidSubjectsForGrade(selectedGrade.name, subjects) : [];

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await addScheduleBlock(formData);
      toast.success("Schedule block added successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to add schedule block.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Add Monday-to-Friday Class Schedule</h3>
      <form action={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Select Day of Week</label>
          <select name="day" className="w-full p-2 border border-slate-200 rounded-lg bg-white outline-none">
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Start Time</label>
            <input required name="timeStart" type="text" placeholder="e.g. 08:00 AM" className="w-full p-2 border border-slate-200 rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">End Time</label>
            <input required name="timeEnd" type="text" placeholder="e.g. 09:00 AM" className="w-full p-2 border border-slate-200 rounded-lg outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Grade Level</label>
            <select 
              name="gradeId" 
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white outline-none"
            >
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Section</label>
            <select name="sectionName" className="w-full p-2 border border-slate-200 rounded-lg bg-white outline-none">
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-500 font-semibold mb-1">Learning Subject Area</label>
          <select name="subjectName" className="w-full p-2 border border-slate-200 rounded-lg bg-white outline-none">
            {validSubjects.length === 0 ? (
              <option value="" disabled>No subjects for this grade...</option>
            ) : (
              validSubjects.map((s: any) => (
                <option key={s.id} value={s.name}>{s.name} [{s.code}]</option>
              ))
            )}
          </select>
        </div>

        <button disabled={isPending} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs shadow transition">
          {isPending ? 'Inserting...' : 'Insert Schedule Block'}
        </button>
      </form>
    </div>
  );
}
