'use client';

import { useState } from 'react';
import { BookOpen, FileText, CheckCircle, Clock, Search, BookMarked, Layers } from 'lucide-react';
import CreateDLLForm from '@/app/(dashboard)/teacher/dll/create/CreateDLLForm';
import Link from 'next/link';

interface LessonLog {
  id: string;
  date: string;
  learningArea: string;
  topic: string;
  status: string;
  submittedDate: Date;
}

export default function TeacherLoadManager({ 
  assignedSubjects, 
  assignedGrades,
  lessonLogs 
}: { 
  assignedSubjects: string[], 
  assignedGrades: string[],
  lessonLogs: LessonLog[] 
}) {
  const [selectedSubject, setSelectedSubject] = useState<string>(assignedSubjects[0] || '');
  const [activeTab, setActiveTab] = useState<'CREATE' | 'HISTORY'>('CREATE');

  // Filter logs for the selected subject
  const subjectLogs = lessonLogs.filter(log => log.learningArea === selectedSubject);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
      {/* Left Sidebar: Subject List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <BookMarked className="w-4 h-4 text-indigo-600" />
            My Subject Load
          </h3>
          
          {assignedSubjects.length === 0 ? (
            <div className="text-center p-4 text-xs text-slate-400 bg-slate-50 rounded-lg">
              No subjects currently assigned to your load.
            </div>
          ) : (
            <div className="space-y-2">
              {assignedSubjects.map(subject => {
                const isActive = selectedSubject === subject;
                return (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setActiveTab('CREATE');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition border text-xs font-bold flex flex-col gap-1 ${
                      isActive 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <span>{subject}</span>
                    {isActive && (
                      <span className="text-[10px] font-medium text-indigo-500 font-mono">Selected Workspace</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Grade Levels Handled
          </h3>
          <div className="flex flex-wrap gap-2">
            {assignedGrades.map(g => (
              <span key={g} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {!selectedSubject ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Select a Subject</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Choose a subject from your load on the left to start constructing a new Daily Lesson Log or to view its submission history.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{selectedSubject}</h2>
                  <p className="text-xs text-slate-500 font-medium">Active Workspace • {subjectLogs.length} Total Logs</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6">
              <button 
                onClick={() => setActiveTab('CREATE')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition ${
                  activeTab === 'CREATE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Create New DLL
              </button>
              <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'HISTORY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                DLL History
                <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-[10px]">{subjectLogs.length}</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 bg-slate-50/30">
              {activeTab === 'CREATE' && (
                <div className="max-w-2xl">
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-800">Construct Daily Lesson Log</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      The learning area has been securely locked to <strong>{selectedSubject}</strong> based on your assigned load matrix.
                    </p>
                  </div>
                  <CreateDLLForm initialSubject={selectedSubject} />
                </div>
              )}

              {activeTab === 'HISTORY' && (
                <div>
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Submission History</h3>
                      <p className="text-xs text-slate-500 mt-1">Review all your previous logs for {selectedSubject}.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {subjectLogs.length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl bg-white">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-600">No Logs Found</p>
                        <p className="text-xs text-slate-400 mt-1">You haven't submitted any lesson logs for this subject yet.</p>
                      </div>
                    ) : (
                      subjectLogs.map(log => (
                        <div key={log.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between group hover:border-indigo-300 transition">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{log.topic}</h4>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> For: {log.date}</span>
                              <span>Submitted: {new Date(log.submittedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                              log.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              log.status === 'For Revision' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {log.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                              {log.status}
                            </span>
                            {log.status === 'For Revision' && (
                              <Link href={`/teacher/dll/${log.id}/edit`} className="opacity-0 group-hover:opacity-100 transition px-3 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold hover:bg-indigo-700">
                                Revise
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
