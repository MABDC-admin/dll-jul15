import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import CreateDLLForm from './CreateDLLForm';

export default async function DLLCreatePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800">Generate and Submit Daily Lesson Log (DLL)</h3>
        <p className="text-xs text-slate-500 mt-1">Fill up the structured DepEd compliance template below.</p>
      </div>
      <CreateDLLForm />
    </div>
  );
}
