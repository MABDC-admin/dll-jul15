'use client';

import { useTransition } from 'react';
import { toggleAnnouncementStatus } from './actions';
import { toast } from 'sonner';

interface Props {
  id: string;
  isActive: boolean;
}

export default function ToggleAnnouncementStatus({ id, isActive }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleAnnouncementStatus(id, !isActive);
        toast.success(`Broadcast marked as ${!isActive ? 'Active' : 'Inactive'}`);
      } catch (error) {
        toast.error('Failed to update status');
      }
    });
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" title="Toggle Broadcast Status">
      <input 
        type="checkbox" 
        checked={isActive} 
        onChange={handleToggle} 
        disabled={isPending}
        className="sr-only peer" 
      />
      <div className={`w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${isPending ? 'opacity-50' : ''} peer-checked:bg-emerald-500`}></div>
    </label>
  );
}
