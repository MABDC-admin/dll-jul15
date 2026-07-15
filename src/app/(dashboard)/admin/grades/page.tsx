import { prisma } from '@/lib/prisma';
import { Layers, Plus } from 'lucide-react';

export default async function GradeLevelsPage() {
  const grades = await prisma.gradeLevel.findMany({
    orderBy: { level: 'asc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <Layers className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Grade Level Configurations</h3>
              <p className="text-xs text-slate-400">Map active school structural levels according to DEPED key stages.</p>
            </div>
          </div>
          <button className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Grade Level
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.map((g) => (
            <div key={g.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{g.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{g.keyStage}</p>
                </div>
                <button className="text-[10px] text-indigo-600 font-bold hover:underline">Edit</button>
              </div>
              <div className="pt-2 flex items-center space-x-2 text-xs">
                <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-semibold">
                  Sort Order: {g.level}
                </span>
                <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-semibold">
                  Sections: {g.count}
                </span>
              </div>
            </div>
          ))}
          {grades.length === 0 && (
            <div className="col-span-3 text-center py-10 text-slate-500 text-sm">
              No Grade Levels configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
