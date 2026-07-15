'use client';

import { toast } from 'sonner';
import { submitDLL } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateDLLForm() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await submitDLL(formData);
      toast.success("Lesson Log submitted for Principal Review.");
      router.push('/teacher/dll');
    } catch (err: any) {
      toast.error(err.message || "Failed to submit DLL.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Date</label>
          <input required name="date" type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Subject</label>
          <input required name="subject" type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Mathematics" />
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Topic / Lesson</label>
          <input required name="topic" type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Enter lesson topic..." />
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Remarks</label>
          <textarea name="remarks" rows={4} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Any additional remarks..."></textarea>
        </div>
      </div>

      <button disabled={isPending} type="submit" className="w-full md:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-md transition">
        {isPending ? 'Submitting...' : 'Submit Lesson Log for Principal Review'}
      </button>
    </form>
  );
}
