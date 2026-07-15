'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { addScheduleBlock, removeScheduleBlock } from './actions';
import { Plus, Trash2, Calendar, Clock, BookOpen, Users } from 'lucide-react';

type Schedule = {
  id: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  gradeId: string;
  sectionName: string;
  subjectName: string;
};

type TeacherProfile = {
  id: string;
  gradeLevels: string;
  sections: string;
  subjects: string;
};

export default function ScheduleBuilder({ schedules, profile }: { schedules: Schedule[], profile: TeacherProfile }) {
  const [isPending, setIsPending] = useState(false);

  const gradeLevels = JSON.parse(profile.gradeLevels || '[]');
  const sections = JSON.parse(profile.sections || '[]');
  const subjects = JSON.parse(profile.subjects || '[]');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Format time (e.g. 14:30 to 2:30 PM)
  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  async function handleAdd(formData: FormData) {
    setIsPending(true);
    try {
      await addScheduleBlock(formData);
      toast.success("Schedule block added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add block");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this schedule block?')) return;
    try {
      await removeScheduleBlock(id);
      toast.success("Schedule block removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove block");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" /> Add New Class Block
        </h3>
        
        {(!gradeLevels.length || !sections.length || !subjects.length) ? (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold">
            You cannot build a schedule until the Principal assigns you Grade Levels, Sections, and Subjects.
          </div>
        ) : (
          <form action={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Day of Week</label>
              <select required name="day" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option value="">Select Day...</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Start Time</label>
                <input required type="time" name="timeStart" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">End Time</label>
                <input required type="time" name="timeEnd" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Grade Level</label>
              <select required name="gradeId" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option value="">Select Grade...</option>
                {gradeLevels.map((g: string) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
              <select required name="sectionName" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option value="">Select Section...</option>
                {sections.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
              <select required name="subjectName" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option value="">Select Subject...</option>
                {subjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-3 pt-2">
              <button disabled={isPending} type="submit" className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50">
                {isPending ? 'Saving Block...' : 'Save Class Block'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800">Weekly Timetable</h3>
        {DAYS.map(day => {
          const dayBlocks = schedules.filter(s => s.day === day).sort((a, b) => a.timeStart.localeCompare(b.timeStart));
          if (dayBlocks.length === 0) return null;

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="bg-slate-50 border-b border-slate-200 p-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" /> {day}
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {dayBlocks.map(block => (
                  <div key={block.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex gap-8">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 min-w-[140px]">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatTime(block.timeStart)} - {formatTime(block.timeEnd)}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><BookOpen className="w-3 h-3" /> Subject</span>
                          <span className="text-sm font-bold text-slate-800">{block.subjectName}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3" /> Class</span>
                          <span className="text-sm font-semibold text-slate-600">{block.gradeId} - {block.sectionName}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(block.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition self-start md:self-auto">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {schedules.length === 0 && (
          <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500 font-medium">
            Your schedule is currently empty. Add blocks above to build your timetable.
          </div>
        )}
      </div>
    </div>
  );
}
