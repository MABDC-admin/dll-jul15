import { prisma } from '@/lib/prisma';
import { BookMarked, Plus } from 'lucide-react';

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <BookMarked className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Learning Subjects Management</h3>
              <p className="text-xs text-slate-400">Map official learning areas and coding.</p>
            </div>
          </div>
          <button className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{s.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.code} • {s.department}</p>
                </div>
                <button className="text-[10px] text-indigo-600 font-bold hover:underline">Edit</button>
              </div>
              <div className="pt-2 flex items-center space-x-2 text-xs">
                <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-semibold text-[10px]">
                  Type: {s.type}
                </span>
                <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-semibold text-[10px]">
                  Band: {s.targetBand}
                </span>
              </div>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="col-span-3 text-center py-10 text-slate-500 text-sm">
              No Subjects configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
