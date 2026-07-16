'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { reviewLessonLog } from './actions';
import { useRouter } from 'next/navigation';
import 'react-quill-new/dist/quill.snow.css';
import { safeJsonParse } from '@/lib/utils';

export default function ReviewClient({ entry, checklist }: { entry: any, checklist: any[] }) {
  const [remarks, setRemarks] = useState(entry.remarks || "");
  const [checklistResponses, setChecklistResponses] = useState<Record<string, string>>(() => {
    const responses: Record<string, string> = {};
    checklist.forEach(item => { responses[item.id] = item.value || "Yes"; });
    return responses;
  });
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const reusableComments = [
    "Content standards met.",
    "Needs more contextualized examples.",
    "Formative assessment is unclear.",
    "Good use of Differentiated Instruction.",
    "Please align with active Key Stage MELCs."
  ];

  const handleChecklistChange = (id: string, value: string) => {
    setChecklistResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = async (action: 'Approve' | 'Revise') => {
    setIsPending(true);
    try {
      await reviewLessonLog(entry.id, action, remarks);
      toast.success(`Lesson log ${action === 'Approve' ? 'approved' : 'returned for revision'}.`);
      router.push('/principal/dll');
    } catch (err: any) {
      toast.error(err.message || "Action failed.");
    } finally {
      setIsPending(false);
    }
  };

  const content = safeJsonParse<any>(entry.content, {});

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <h3 className="text-base font-bold text-slate-800">Reviewing Lesson Plan: {entry.id.slice(0,12)}</h3>
            <span className="text-xs text-indigo-600 font-semibold">{entry.teacherProfile.user.name} • {entry.learningArea}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-extrabold uppercase text-indigo-600">Daily Lesson Plan Preview</h4>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed space-y-3 text-slate-700">
            <p><span className="font-bold text-slate-900">Teaching Date:</span> {entry.teachingDates}</p>
            <div className="ql-snow">
              <span className="font-bold text-slate-900 mb-2 block">Topic / Lesson:</span>
              <div 
                className="bg-white p-4 rounded border border-slate-200 text-slate-700 font-sans ql-editor max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: content.topic || "No content provided." }}
              />
            </div>
            <p><span className="font-bold text-slate-900">Teacher Remarks:</span> {content.remarks || "None"}</p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rubric Checklist</h4>
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-600 pr-2 leading-snug">{item.text}</span>
                <div className="flex items-center space-x-1">
                  {["Yes", "No", "N/A"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleChecklistChange(item.id, opt)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${checklistResponses[item.id] === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700">Academic Director Remarks / Comments</label>
            <textarea 
              rows={3} 
              placeholder="State suggestions or review commentary..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <div className="flex flex-wrap gap-1">
              {reusableComments.map((com, index) => (
                <button 
                  key={index} 
                  type="button"
                  onClick={() => setRemarks(com)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded"
                >
                  {com.slice(0, 20)}...
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button disabled={isPending} onClick={() => handleAction('Revise')} className="flex-1 flex items-center justify-center space-x-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 py-2.5 rounded-lg text-xs font-bold transition">
                <AlertTriangle className="w-4 h-4" /> <span>Mark for Revision</span>
              </button>
              <button disabled={isPending} onClick={() => handleAction('Approve')} className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition">
                <CheckCircle className="w-4 h-4" /> <span>Approve DLL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
