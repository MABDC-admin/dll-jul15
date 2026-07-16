'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { resolveAnecdotal } from './actions';
import { CheckCircle2 } from 'lucide-react';

export default function ResolveAnecdotalForm({ recordId }: { recordId: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    formData.append('recordId', recordId);
    
    try {
      await resolveAnecdotal(formData);
      toast.success("Anecdotal record resolved successfully.");
      router.push('/principal/anecdotal');
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve record.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        Official Resolution
      </h3>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">Academic Director's Remarks / Resolution</label>
          <textarea 
            required 
            name="resolution" 
            rows={4} 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm resize-y" 
            placeholder="Provide official remarks, disciplinary actions, or guidance for the teacher..."
          ></textarea>
        </div>

        <button disabled={isPending} type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-md transition flex justify-center items-center gap-2">
          {isPending ? 'Resolving...' : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
            </>
          )}
        </button>
      </form>
    </div>
  );
}
