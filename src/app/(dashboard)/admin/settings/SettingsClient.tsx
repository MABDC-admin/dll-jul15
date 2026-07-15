'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { updateSystemConfig } from './actions';
import { Settings2, Database, AlertCircle, Save } from 'lucide-react';

export default function SettingsClient({ config }: { config: any }) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await updateSystemConfig(formData);
      toast.success("System configurations updated securely.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update configuration.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <Settings2 className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Global System Settings</h3>
            <p className="text-xs text-slate-400">Manage active terms, frameworks, and deployment thresholds.</p>
          </div>
        </div>

        <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">Academic Term Context</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Active School Year</label>
                <input required name="schoolYear" type="text" defaultValue={config?.schoolYear} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Active Quarter/Term</label>
                <input required name="term" type="text" defaultValue={config?.term} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">Curriculum Framework</label>
                <input required name="activeFramework" type="text" defaultValue={config?.activeFramework} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="pt-2">
              <button disabled={isPending} type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
                <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">License & Subscription</h4>
            <div className="bg-slate-800 text-white p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Plan Tier</span>
                <span className="text-sm font-bold">{config?.subscriptionTier || 'Free Trial'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Status</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold uppercase tracking-wider">{config?.subscriptionStatus || 'TRIAL'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">Renewal Date</span>
                <span className="text-sm font-bold">{config?.renewalDate || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
             <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Quotas and Capacity</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Allocated User Seats</p>
                  <p className="text-xl font-black text-slate-800 mt-1">{config?.allottedUsers || 0}</p>
               </div>
               <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Allocated Learners Capacity</p>
                  <p className="text-xl font-black text-slate-800 mt-1">{config?.allottedLearners || 0}</p>
               </div>
               <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Storage Utilization</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <p className="text-xl font-black text-indigo-600">{config?.storageUsed || 0} GB</p>
                    <span className="text-xs text-slate-400">/ {config?.storageAllotted || 0} GB</span>
                  </div>
               </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
