import { prisma } from '@/lib/prisma';
import CreateAnecdotalForm from './CreateAnecdotalForm';

export default async function CreateAnecdotalPage() {
  const learners = await prisma.learner.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800">File Anecdotal Record</h3>
        <p className="text-xs text-slate-500 mt-1">Document a behavioral incident or observation for a specific learner.</p>
      </div>
      <CreateAnecdotalForm learners={learners} />
    </div>
  );
}
