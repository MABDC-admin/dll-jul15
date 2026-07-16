import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function WeeklyTrackerPage({
  searchParams,
}: {
  searchParams: { week?: string, term?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'PRINCIPAL') {
    redirect('/login');
  }

  // Default to week 1 if no search param
  const selectedWeek = searchParams.week || '1';
  const selectedTerm = searchParams.term || '1st Term';

  // Fetch all teachers and grades
  const [teachers, allGrades] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: {
        user: true,
        subjectLoads: true,
        lessonLogs: {
          where: { 
            weekNumber: selectedWeek,
            term: selectedTerm
          }
        }
      }
    }),
    prisma.gradeLevel.findMany({
      orderBy: { level: 'asc' }
    })
  ]);

  const gradeLevelMap = new Map(allGrades.map(g => [g.id, g.level]));
  const gradeNameMap = new Map(allGrades.map(g => [g.name, g.level]));

  // Sort by lowest grade level assigned
  const sortedTeachers = teachers.sort((a, b) => {
    const getLowestGrade = (teacher: any) => {
      if (!teacher.subjectLoads || teacher.subjectLoads.length === 0) return 999;
      const levels = teacher.subjectLoads.map((load: any) => {
        return gradeLevelMap.get(load.gradeId) ?? gradeNameMap.get(load.gradeId) ?? 999;
      });
      return Math.min(...levels);
    };

    const levelA = getLowestGrade(a);
    const levelB = getLowestGrade(b);

    if (levelA !== levelB) {
      return levelA - levelB;
    }
    
    // Sort alphabetically by name as fallback
    return a.user.name.localeCompare(b.user.name);
  });

  const weekOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const termOptions = ['1st Term', '2nd Term', '3rd Term'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Weekly DLL Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">Monitor teacher compliance for assigned subjects per week.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-500">Term:</label>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {termOptions.map(t => (
                <Link 
                  key={t} 
                  href={`?term=${t}&week=${selectedWeek}`}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${t === selectedTerm ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-500">Week:</label>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto max-w-[200px] md:max-w-md">
              {weekOptions.map(w => (
                <Link 
                  key={w} 
                  href={`?term=${selectedTerm}&week=${w}`}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${w === selectedWeek ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  W{w}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Teacher</th>
                <th className="p-4">Assigned Subjects</th>
                <th className="p-4 text-center">Submitted Logs (W{selectedWeek})</th>
                <th className="p-4">Status</th>
                <th className="p-4">Subject Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTeachers.map(teacher => {
                let assignedSubjects: string[] = Array.from(new Set(teacher.subjectLoads.map((l: any) => l.subjectName)));
                
                // Fallback to flat arrays if empty (for backwards compatibility)
                if (assignedSubjects.length === 0) {
                  try {
                    assignedSubjects = JSON.parse(teacher.subjects || '[]');
                  } catch {
                    assignedSubjects = [];
                  }
                }
                
                // Get unique submitted subjects for this week
                const submittedLogs = teacher.lessonLogs;
                const submittedSubjects = Array.from(new Set(submittedLogs.map(log => log.learningArea)));
                
                // Calculate missing subjects
                const missingSubjects = assignedSubjects.filter(sub => !submittedSubjects.includes(sub));
                
                const isComplete = assignedSubjects.length > 0 && missingSubjects.length === 0;
                const isPartial = submittedSubjects.length > 0 && missingSubjects.length > 0;
                
                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">
                          {teacher.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{teacher.user.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {teacher.subjectLoads && teacher.subjectLoads.length > 0 
                              ? Array.from(new Set(teacher.subjectLoads.map((l: any) => l.gradeId))).join(", ")
                              : teacher.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedSubjects.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">No assigned subjects</span>
                        ) : (
                          assignedSubjects.map(sub => (
                            <span key={sub} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                              {sub}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4 text-center">
                      <span className="text-lg font-black text-slate-800">{submittedSubjects.length}</span>
                      <span className="text-xs font-bold text-slate-400"> / {assignedSubjects.length}</span>
                    </td>
                    
                    <td className="p-4">
                      {assignedSubjects.length === 0 ? (
                        <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded-full font-bold">N/A</span>
                      ) : isComplete ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full font-bold">
                          <AlertCircle className="w-3 h-3" /> Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full font-bold">
                          <XCircle className="w-3 h-3" /> Incomplete
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedSubjects.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">No assigned subjects</span>
                        ) : (
                          assignedSubjects.map(sub => {
                            const isSubmitted = submittedSubjects.includes(sub);
                            return (
                              <span 
                                key={sub} 
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isSubmitted 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}
                              >
                                {sub}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {teachers.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No teachers found in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
