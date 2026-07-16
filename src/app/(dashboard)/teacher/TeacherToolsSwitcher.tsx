'use client';

import { useState } from 'react';
import { PenTool, Calendar } from 'lucide-react';
import CreateDLLForm from './dll/create/CreateDLLForm';
import ScheduleBuilderForm from './schedule/ScheduleBuilderForm';

interface Grade {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  targetBand: string;
}

export default function TeacherToolsSwitcher({ grades, subjects }: { grades: Grade[], subjects: Subject[] }) {
  const [activeTab, setActiveTab] = useState<'DLL' | 'SCHEDULE'>('DLL');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-fadeIn">
      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('DLL')}
          className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'DLL' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <PenTool className="w-4 h-4" /> DLL Creator
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULE')}
          className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'SCHEDULE' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" /> Schedule Builder
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'DLL' ? (
          <div className="space-y-4">
            <div className="mb-2 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800">Create Daily Lesson Log</h3>
              <p className="text-[10px] text-slate-500">Construct high-quality instructional designs compliant with guidelines.</p>
            </div>
            <CreateDLLForm />
          </div>
        ) : (
          <ScheduleBuilderForm grades={grades} subjects={subjects} />
        )}
      </div>
    </div>
  );
}
