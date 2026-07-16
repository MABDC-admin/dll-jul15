import CreateAnnouncementForm from './CreateAnnouncementForm';

export default function CreateAnnouncementPage() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800">Create Broadcast Announcement</h3>
        <p className="text-xs text-slate-500 mt-1">This announcement will pop up on every teacher's dashboard when they log in.</p>
      </div>
      <CreateAnnouncementForm />
    </div>
  );
}
