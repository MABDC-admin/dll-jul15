import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-[60vh] animate-fadeIn">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold animate-pulse">Loading operations data...</p>
      </div>
    </div>
  );
}
