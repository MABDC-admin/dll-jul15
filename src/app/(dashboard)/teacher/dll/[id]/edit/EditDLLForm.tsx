'use client';

import { useState } from 'react';
import { resubmitDLL } from './actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Send } from 'lucide-react';
import DynamicQuill from '@/components/ui/DynamicQuill';

export default function EditDLLForm({ log }: { log: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  let parsedTopic = '';
  let parsedRemarks = '';
  
  try {
    const parsed = JSON.parse(log.content || '{}');
    parsedTopic = parsed.topic || '';
    parsedRemarks = parsed.remarks || '';
  } catch (e) {
    // Keep empty if parsing fails
  }

  const [topicContent, setTopicContent] = useState(parsedTopic);

  // format teachingDates for input type="date"
  let initialDate = '';
  if (log.teachingDates) {
    try {
      initialDate = new Date(log.teachingDates).toISOString().split('T')[0];
    } catch {}
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    formData.append('logId', log.id);

    const rawContent = topicContent.replace(/<[^>]*>?/gm, '').trim();
    if (!rawContent) {
      toast.error("Topic / Lesson Content is required.");
      setIsPending(false);
      return;
    }
    formData.set('topic', topicContent);

    try {
      await resubmitDLL(formData);
      toast.success("DLL resubmitted successfully!");
      router.push('/teacher/dll');
    } catch (err: any) {
      toast.error(err.message || "Failed to resubmit DLL");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {log.remarks && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Academic Director's Revision Notes</h4>
            <p className="text-xs text-amber-700 mt-1">"{log.remarks}"</p>
          </div>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Teaching Date</label>
            <input 
              required 
              type="date" 
              name="teachingDate" 
              defaultValue={initialDate}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Subject / Learning Area</label>
            <input 
              required 
              type="text" 
              name="learningArea" 
              defaultValue={log.learningArea}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Term</label>
            <select required name="term" defaultValue={log.term || "1st Term"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium">
              <option value="1st Term">1st Term</option>
              <option value="2nd Term">2nd Term</option>
              <option value="3rd Term">3rd Term</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Week Number</label>
            <select required name="weekNumber" defaultValue={log.weekNumber || "1"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                <option key={w} value={w.toString()}>Week {w}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1.5">Topic / Lesson Content</label>
          <DynamicQuill 
            value={topicContent} 
            onChange={setTopicContent} 
            placeholder="Enter the lesson objectives, content, and procedures..." 
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1.5">Teacher's Remarks (Optional)</label>
          <input 
            type="text" 
            name="remarks"
            defaultValue={parsedRemarks}
            placeholder="Any notes regarding this revision..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="pt-2">
          <button 
            disabled={isPending} 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-sm transition flex justify-center items-center gap-2"
          >
            {isPending ? 'Resubmitting...' : (
              <>
                <Send className="w-4 h-4" /> Save & Resubmit to Academic Director
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
