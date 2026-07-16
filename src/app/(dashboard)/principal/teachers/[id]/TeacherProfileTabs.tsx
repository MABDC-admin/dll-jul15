'use client';

import { useState } from 'react';
import { Calendar, Clock, BookOpen, Users, FileText, Plus, Trash2, Layers } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { toast } from 'sonner';
import { addTeacherScheduleBlock, removeTeacherScheduleBlock } from './actions';
import { addSubjectLoad, removeSubjectLoad } from './loadActions';

export default function TeacherProfileTabs({ 
  schedules, 
  lessonLogs, 
  profile,
  allGrades = [],
  allSubjects = []
}: { 
  schedules: any[], 
  lessonLogs: any[],
  profile: any,
  allGrades?: any[],
  allSubjects?: any[]
}) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'dlls' | 'load'>('load');
  const [isPending, setIsPending] = useState(false);

  // Dynamic dropdown state for assigning Subject Load
  const [selectedLoadGrade, setSelectedLoadGrade] = useState('');

  const subjectLoads = profile.subjectLoads || [];

  const subjectLoads = profile.subjectLoads || [];

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  async function handleAddSchedule(formData: FormData) {
    setIsPending(true);
    formData.set('teacherProfileId', profile.id);
    const loadDataStr = formData.get('loadData') as string;
    if (loadDataStr) {
      try {
        const loadData = JSON.parse(loadDataStr);
        formData.set('gradeId', loadData.gradeId);
        formData.set('sectionName', loadData.sectionName);
        formData.set('subjectName', loadData.subjectName);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    try {
      await addTeacherScheduleBlock(formData);
      toast.success("Schedule block added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add block");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm('Remove this schedule block?')) return;
    try {
      await removeTeacherScheduleBlock(id, profile.id);
      toast.success("Schedule block removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove block");
    }
  }

  async function handleAddLoad(formData: FormData) {
    setIsPending(true);
    formData.set('teacherProfileId', profile.id);
    try {
      await addSubjectLoad(formData);
      toast.success("Subject load assigned successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to assign load");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDeleteLoad(id: string) {
    if (!confirm('Remove this assigned subject load?')) return;
    try {
      await removeSubjectLoad(id, profile.id);
      toast.success("Subject load removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove load");
    }
  }

  // Calculate dynamic sections and subjects for the selected grade
  const selectedGradeObj = allGrades.find(g => g.name === selectedLoadGrade);
  const availableSections = selectedGradeObj ? JSON.parse(selectedGradeObj.sections || '[]') : [];
  
  // Filter centralized subjects by checking if selectedLoadGrade is in their gradeLevels array
  const availableSubjects = selectedLoadGrade 
    ? allSubjects
        .filter(sub => {
          const mappedGrades = JSON.parse(sub.gradeLevels || '[]');
          return mappedGrades.includes(selectedLoadGrade);
        })
        .map(sub => sub.name)
    : [];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('load')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'load' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Subject Load (Assignments)
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'schedule' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Weekly Class Schedule
        </button>
        <button
          onClick={() => setActiveTab('dlls')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'dlls' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> DLL History 
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] leading-none">{lessonLogs.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn space-y-6">

        {/* SUBJECT LOAD TAB */}
        {activeTab === 'load' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <div className="mb-4">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" /> Assign New Subject Load
                </h3>
                <p className="text-xs text-slate-500 mt-1">Strictly map a specific Subject to a specific Grade and Section for this teacher. This automatically populates their flat permission arrays.</p>
              </div>
              
              <form action={handleAddLoad} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Grade Level</label>
                  <select 
                    required 
                    name="gradeId" 
                    value={selectedLoadGrade}
                    onChange={(e) => setSelectedLoadGrade(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Select Grade...</option>
                    {allGrades.map((g: any) => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
                  <select 
                    required 
                    name="sectionName" 
                    disabled={!selectedLoadGrade || availableSections.length === 0}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                  >
                    <option value="">{availableSections.length > 0 ? "Select Section..." : "No sections found"}</option>
                    {availableSections.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                  <select 
                    required 
                    name="subjectName" 
                    disabled={!selectedLoadGrade || availableSubjects.length === 0}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                  >
                    <option value="">{availableSubjects.length > 0 ? "Select Subject..." : "No subjects found"}</option>
                    {availableSubjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <button disabled={isPending} type="submit" className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {isPending ? 'Assigning...' : 'Assign Load'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Assigned Load Matrix</h3>
                <div className="bg-white border border-slate-200 text-slate-600 px-3 py-1 text-xs font-bold rounded-lg shadow-sm">
                  Total Loads: {subjectLoads.length}
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {subjectLoads.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No strict subject loads assigned yet.
                  </div>
                ) : (
                  subjectLoads.sort((a: any, b: any) => a.gradeId.localeCompare(b.gradeId)).map((load: any) => (
                    <div key={load.id} className="p-4 flex items-center justify-between hover:bg-indigo-50/30 transition group">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">{load.subjectName}</h4>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                              {load.gradeId}
                            </span>
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                              Section {load.sectionName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wide">Load ID: {load.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteLoad(load.id)} 
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove Load"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Add Class Block
              </h3>
              
              {subjectLoads.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold">
                  You must assign a Subject Load to this teacher first!
                </div>
              ) : (
                <form action={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Day of Week</label>
                    <select required name="day" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                      <option value="">Select Day...</option>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Start Time</label>
                      <input required type="time" name="timeStart" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">End Time</label>
                      <input required type="time" name="timeEnd" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Assigned Class (Subject Load)</label>
                    <select required name="loadData" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                      <option value="">Select an assigned class...</option>
                      {subjectLoads.map((load: any) => (
                        <option key={load.id} value={JSON.stringify({ gradeId: load.gradeId, sectionName: load.sectionName, subjectName: load.subjectName })}>
                          {load.subjectName} ({load.gradeId} - {load.sectionName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 pt-2">
                    <button disabled={isPending} type="submit" className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50">
                      {isPending ? 'Saving Block...' : 'Save Class Block'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-4 mt-8">
              <h3 className="text-xl font-black text-slate-800">Weekly Timetable</h3>
              {DAYS.map(day => {
                const dayBlocks = schedules.filter(s => s.day === day).sort((a, b) => a.timeStart.localeCompare(b.timeStart));
                if (dayBlocks.length === 0) return null;

                return (
                  <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" /> {day}
                      </h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {dayBlocks.map(block => (
                        <div key={block.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                          <div className="flex gap-8">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 min-w-[140px]">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {formatTime(block.timeStart)} - {formatTime(block.timeEnd)}
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><BookOpen className="w-3 h-3" /> Subject</span>
                                <span className="text-sm font-bold text-slate-800">{block.subjectName}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3" /> Class</span>
                                <span className="text-sm font-semibold text-slate-600">{block.gradeId} - {block.sectionName}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteSchedule(block.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition self-start md:self-auto">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {schedules.length === 0 && (
                <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-500 font-medium">
                  This teacher has no scheduled classes yet.
                </div>
              )}
            </div>
          </>
        )}

        {/* DLLS TAB */}
        {activeTab === 'dlls' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">Submitted Daily Lesson Logs</h3>
                <p className="text-sm text-slate-500 mt-1">A complete history of all DLLs submitted by this educator.</p>
              </div>
              <select 
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value && e.target.value !== 'all') {
                    url.searchParams.set('term', e.target.value);
                  } else {
                    url.searchParams.delete('term');
                    if (e.target.value === 'all') {
                      url.searchParams.set('term', 'all');
                    }
                  }
                  window.history.replaceState({}, '', url);
                  window.location.reload(); 
                }}
                defaultValue={typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('term') !== null ? new URLSearchParams(window.location.search).get('term')! : 'default') : 'default'}
                className="py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-700 font-bold max-w-[200px]"
              >
                <option value="default" disabled>Select Term...</option>
                <option value="all">All Terms</option>
                <option value="1st Term">1st Term</option>
                <option value="2nd Term">2nd Term</option>
                <option value="3rd Term">3rd Term</option>
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Submission ID</th>
                    <th className="p-4">Learning Area</th>
                    <th className="p-4">Term & Week</th>
                    <th className="p-4">Teaching Dates</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lessonLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">No DLLs have been submitted by this teacher for this filter.</td>
                    </tr>
                  ) : (
                    lessonLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-mono text-slate-500 text-xs">{log.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4 font-bold text-slate-800">{log.learningArea}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-[10px] border border-slate-200 whitespace-nowrap">
                            {log.term} - Wk {log.weekNumber}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{log.teachingDates}</td>
                        <td className="p-4">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="p-4 flex justify-end">
                          <Link href={`/principal/dll/${log.id}`} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold rounded-lg transition text-[11px] flex items-center gap-1">
                            <FileText className="w-3 h-3" /> View DLL
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
