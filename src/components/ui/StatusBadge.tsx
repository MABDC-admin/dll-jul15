import React from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let bg = "bg-slate-100";
  let text = "text-slate-600";
  let Icon = Clock;

  if (status.includes("Pending")) {
    bg = "bg-amber-50";
    text = "text-amber-600 border-amber-200";
    Icon = Clock;
  } else if (status.includes("Approved")) {
    bg = "bg-emerald-50";
    text = "text-emerald-600 border-emerald-200";
    Icon = CheckCircle;
  } else if (status.includes("Revision")) {
    bg = "bg-rose-50";
    text = "text-rose-600 border-rose-200";
    Icon = AlertTriangle;
  } else if (status.includes("Resolved")) {
    bg = "bg-emerald-50";
    text = "text-emerald-600 border-emerald-200";
    Icon = CheckCircle;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${bg} ${text} flex items-center space-x-1 w-max`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </span>
  );
}
