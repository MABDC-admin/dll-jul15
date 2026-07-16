import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function TeacherAnecdotalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const resolvedParams = await params;
  const recordId = resolvedParams.id;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true }
  });

  const record = await prisma.anecdotalRecord.findUnique({
    where: { id: recordId },
    include: {
      learner: true,
      teacherProfile: { include: { user: true } }
    }
  });

  if (!record || !user?.teacherProfile) notFound();

  // Ensure this teacher owns the record
  if (record.teacherProfileId !== user.teacherProfile.id) {
    redirect('/teacher/anecdotal');
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      <div className="flex items-center space-x-3">
        <Link href="/teacher/anecdotal" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition text-slate-500 hover:text-slate-700 shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-slate-800">Anecdotal Record Details</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100 shadow-sm">
              {record.learner.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">{record.learner.name}</h3>
              <div className="flex items-center text-xs font-bold text-slate-500 mt-0.5 space-x-3">
                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{record.learner.gradeSection}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Reported by You</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={record.status} />
            <div className="flex items-center text-[10px] font-bold text-slate-400 gap-3">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Incident: {new Date(record.incidentDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Filed: {new Date(record.submittedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4">
          <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Record Type</p>
            <p className={`text-sm font-bold ${
              record.recordType === 'Merit' ? 'text-emerald-600' : 
              record.recordType === 'Demerit' ? 'text-rose-600' : 'text-slate-700'
            }`}>{record.recordType}</p>
          </div>
          <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Severity Weight</p>
            <p className={`text-sm font-bold ${
              record.severity === 'Severe' ? 'text-rose-600' : 
              record.severity === 'Moderate' ? 'text-amber-600' : 'text-slate-700'
            }`}>{record.severity}</p>
          </div>
          <div className="flex-1 min-w-[200px] bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Incident Type</p>
            <p className="text-sm font-bold text-slate-800">{record.incidentType}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Incident Description
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {record.description}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Immediate Action Taken by Teacher</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {record.actionTaken}
            </p>
          </div>
        </div>
      </div>

      {record.status === 'Resolved' && record.principalResolution && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h4 className="text-sm font-bold text-emerald-800">Academic Director's Official Resolution</h4>
              <p className="text-xs font-bold text-emerald-600/80 mt-0.5 mb-3">Resolved on {record.resolvedDate ? new Date(record.resolvedDate).toLocaleDateString() : 'Unknown'}</p>
              <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed bg-white/50 p-4 rounded-xl border border-emerald-100">
                {record.principalResolution}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {record.status === 'Pending Review' && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm text-center">
          <p className="text-sm font-bold text-amber-800">This record is currently pending review by the Academic Director.</p>
          <p className="text-xs text-amber-700 mt-1">You will be notified once an official resolution is provided.</p>
        </div>
      )}
    </div>
  );
}
