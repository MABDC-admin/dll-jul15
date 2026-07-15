import { prisma } from '@/lib/prisma';
import { Activity, Plus } from 'lucide-react';

export default async function ChecklistsPage() {
  const rubrics = await prisma.checklistRubric.findMany();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Quality Assurance Checklist Rubrics</h3>
              <p className="text-xs text-slate-400">Manage inspection criteria for lesson log validation based on active regional orders.</p>
            </div>
          </div>
          <button className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Metric
          </button>
        </div>

        <div className="space-y-3">
          {rubrics.map((rubric) => (
            <div key={rubric.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <div className="flex items-center space-x-3">
                <input type="checkbox" disabled checked className="w-4 h-4 text-indigo-600 rounded" />
                <p className="text-xs font-semibold text-slate-700">{rubric.text}</p>
              </div>
              <button className="text-[10px] text-rose-500 font-bold hover:underline">Remove</button>
            </div>
          ))}
          {rubrics.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              No rubrics found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
