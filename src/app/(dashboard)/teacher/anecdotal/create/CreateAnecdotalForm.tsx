'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitAnecdotal } from './actions';
import { Learner } from '@prisma/client';

export default function CreateAnecdotalForm({ learners }: { learners: Learner[] }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await submitAnecdotal(formData);
      toast.success("Anecdotal record submitted to Academic Director.");
      router.push('/teacher');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit record.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Select Learner</label>
          <select required name="learnerId" defaultValue="" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800">
            <option value="" disabled>Select a student...</option>
            {learners.map(l => (
              <option key={l.id} value={l.id}>{l.name} - {l.gradeSection}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Date of Incident</label>
          <input required name="incidentDate" type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Time of Incident</label>
          <input required name="incidentTime" type="time" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Record Type</label>
          <select required name="recordType" defaultValue="Neutral" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800">
            <option value="Merit">Merit (Positive)</option>
            <option value="Neutral">Neutral (Observation)</option>
            <option value="Demerit">Demerit (Negative)</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Severity / Weight</label>
          <select required name="severity" defaultValue="Minor" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800">
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Incident Type</label>
          <input required type="text" name="incidentType" placeholder="e.g. smoking, cutting class, bullying, etc." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800" />
        </div>
      </div>

      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Incident Description</label>
          <textarea required name="description" rows={4} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 resize-y" placeholder="Describe the behavior or incident objectively..."></textarea>
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Immediate Action Taken</label>
          <textarea required name="actionTaken" rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 resize-y" placeholder="What actions did you take immediately following the incident?..."></textarea>
        </div>
      </div>

      <button disabled={isPending} type="submit" className="w-full md:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-md transition">
        {isPending ? 'Submitting...' : 'Submit to Academic Director'}
      </button>
    </form>
  );
}
