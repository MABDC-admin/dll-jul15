'use client';

import { toast } from 'sonner';
import { submitDLL } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DynamicQuill from '@/components/ui/DynamicQuill';
import { getCurrentTerm } from '@/lib/term';
import { AlertCircle } from 'lucide-react';

export default function CreateDLLForm({ 
  initialSubject, 
  subjectLoads = [],
  existingLogs = [] 
}: { 
  initialSubject?: string, 
  subjectLoads?: any[],
  existingLogs?: any[]
}) {
  const [isPending, setIsPending] = useState(false);
  const [topicContent, setTopicContent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(getCurrentTerm());
  const [selectedWeek, setSelectedWeek] = useState('1');
  const router = useRouter();

  // Filter out classes that already have a DLL submitted for the selected term and week
  const availableLoads = subjectLoads.filter(load => {
    const classLabel = `${load.subjectName} (${load.gradeId} - ${load.sectionName})`;
    const hasLog = existingLogs.some(log => 
      log.learningArea === classLabel && 
      log.term === selectedTerm && 
      log.weekNumber === selectedWeek
    );
    return !hasLog;
  });

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    if (initialSubject) formData.set('subject', initialSubject);
    
    const rawContent = topicContent.replace(/<[^>]*>?/gm, '').trim();
    if (!rawContent) {
      toast.error("Topic / Lesson Content is required.");
      setIsPending(false);
      return;
    }
    formData.set('topic', topicContent);

    try {
      await submitDLL(formData);
      toast.success("Lesson Log submitted for Academic Director Review.");
      router.push('/teacher/dll');
    } catch (err: any) {
      toast.error(err.message || "Failed to submit DLL.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {availableLoads.length > 0 && !initialSubject && (
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-600 text-xs flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Missing Submissions (Term: {selectedTerm}, Week: {selectedWeek}):</p>
            <ul className="list-disc list-inside">
              {availableLoads.map(load => (
                <li key={load.id}>{`${load.subjectName} (${load.gradeId} - ${load.sectionName})`}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {availableLoads.length === 0 && !initialSubject && subjectLoads.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-emerald-600 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-bold">Awesome! You have submitted all Lesson Logs for {selectedTerm}, Week {selectedWeek}.</span>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Date</label>
          <input required name="date" type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Subject</label>
          {initialSubject ? (
            <input 
              required 
              name="subject" 
              type="text" 
              defaultValue={initialSubject}
              disabled={true}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:font-bold" 
            />
          ) : subjectLoads.length > 0 ? (
            <select
              required
              name="subject"
              defaultValue=""
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            >
              <option value="" disabled>Select an assigned class...</option>
              {availableLoads.map(load => {
                const label = `${load.subjectName} (${load.gradeId} - ${load.sectionName})`;
                return <option key={load.id} value={label}>{label}</option>;
              })}
              {availableLoads.length === 0 && (
                <option value="" disabled>All classes have DLLs for this week!</option>
              )}
            </select>
          ) : (
            <input 
              required 
              name="subject" 
              type="text" 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" 
              placeholder="e.g. Mathematics" 
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Term</label>
          <select 
            required 
            name="term" 
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
          >
            <option value="1st Term">1st Term</option>
            <option value="2nd Term">2nd Term</option>
            <option value="3rd Term">3rd Term</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Week Number</label>
          <select 
            required 
            name="weekNumber" 
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
              <option key={w} value={w.toString()}>Week {w}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-slate-500 font-bold mb-1">Topic / Lesson Content</label>
          <DynamicQuill 
            value={topicContent} 
            onChange={setTopicContent} 
            placeholder="Enter lesson objectives, content, and procedures..." 
          />
        </div>
        <div>
          <label className="block text-slate-500 font-bold mb-1">Teacher's Remarks (Optional)</label>
          <input type="text" name="remarks" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Any notes regarding this submission..." />
        </div>
      </div>

      <button disabled={isPending || (availableLoads.length === 0 && !initialSubject)} type="submit" className="w-full md:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-md transition">
        {isPending ? 'Submitting...' : 'Submit Lesson Log for Academic Director Review'}
      </button>
    </form>
    </div>
  );
}
