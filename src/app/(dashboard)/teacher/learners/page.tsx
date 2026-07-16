import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function TeacherLearnersList() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  // Get the teacher's profile with subject loads
  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId: session.user.id },
    include: { subjectLoads: true }
  });

  if (!teacherProfile) {
    redirect('/login');
  }

  // Get unique grade names from subjectLoads
  let assignedGrades: string[] = Array.from(new Set(teacherProfile.subjectLoads.map(l => l.gradeId)));

  // Fallback to legacy flat arrays if no subject loads
  if (assignedGrades.length === 0) {
    try {
      assignedGrades = JSON.parse(teacherProfile.gradeLevels || '[]');
    } catch {
      assignedGrades = [];
    }
  }

  // Get unique sections from subjectLoads
  let assignedSections: string[] = Array.from(new Set(teacherProfile.subjectLoads.map(l => l.sectionName)));

  if (assignedSections.length === 0) {
    try {
      assignedSections = JSON.parse(teacherProfile.sections || '[]');
    } catch {
      assignedSections = [];
    }
  }

  // Filter learners by the teacher's assigned grades
  const learners = await prisma.learner.findMany({
    where: assignedGrades.length > 0 
      ? { gradeId: { in: assignedGrades } }
      : undefined,
    orderBy: [
      { gradeId: 'asc' },
      { gradeSection: 'asc' },
      { name: 'asc' }
    ]
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">My Handled Class Learners Directory</h3>
            <p className="text-xs text-slate-400">Standard pupil monitoring based on s. 2026 classroom responsive guidance.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {assignedGrades.map(g => (
              <span key={g} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold rounded-lg">{g}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">LRN ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Grade & Section</th>
              <th className="py-3 px-4">GPA Score</th>
              <th className="py-3 px-4">Risk Factor</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {learners.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500 italic">No learners found for your assigned grade levels.</td>
              </tr>
            ) : (
              learners.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">{student.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{student.name}</td>
                  <td className="py-3 px-4 text-slate-600">{student.gradeId} - {student.gradeSection}</td>
                  <td className="py-3 px-4 font-bold text-indigo-600">{student.gpa}% ({student.performance})</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      student.riskLevel === "Low" ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>{student.riskLevel}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold px-3 py-1 rounded transition border border-indigo-100">
                      View Log
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
