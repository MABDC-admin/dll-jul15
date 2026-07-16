'use client';

import { toast } from 'sonner';
import { addScheduleBlock } from './actions';
import { useState, useEffect } from 'react';
import { getValidSubjectsForGrade } from '@/lib/subject-mapper';

export default function ScheduleBuilderForm({ subjectLoads }: { subjectLoads: any[] }) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const loadDataStr = formData.get('loadData') as string;
    if (loadDataStr) {
      try {
        const loadData = JSON.parse(loadDataStr);
        formData.set('gradeId', loadData.gradeId);
        formData.set('sectionName', loadData.sectionName);
        formData.set('subjectName', loadData.subjectName);
      } catch (e) {
        // ignore parse error
      }
    }
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

        <div className="pt-2">
          <label className="block text-slate-500 font-semibold mb-1">Assigned Class (Subject Load)</label>
          <select required name="loadData" className="w-full p-2 border border-slate-200 rounded-lg bg-white outline-none">
            <option value="" disabled selected>Select an assigned class...</option>
            {subjectLoads.length === 0 ? (
              <option value="" disabled>No subject loads assigned by Principal...</option>
            ) : (
              subjectLoads.map((load: any) => (
                <option key={load.id} value={JSON.stringify({ gradeId: load.gradeId, sectionName: load.sectionName, subjectName: load.subjectName })}>
                  {load.subjectName} ({load.gradeId} - {load.sectionName})
                </option>
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
