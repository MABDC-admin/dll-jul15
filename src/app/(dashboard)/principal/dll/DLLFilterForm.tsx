'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentTerm } from '@/lib/term';

export default function DLLFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentQuery = searchParams?.get('q') || '';
  // If term is not in URL, default to current term
  const urlTerm = searchParams?.get('term');
  const currentTerm = urlTerm !== null ? urlTerm : (mounted ? getCurrentTerm() : '');
  const currentWeek = searchParams?.get('week') || '';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
      if (key === 'term' && value === 'all') {
        params.set('term', 'all');
      }
    }
    router.push(`?${params.toString()}`);
  };

  if (!mounted) return <div className="h-10"></div>; // Prevents hydration mismatch

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full max-w-3xl">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text" 
          placeholder="Search Teacher or Subject..." 
          defaultValue={currentQuery}
          onChange={(e) => updateFilters('q', e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <select 
        value={currentTerm}
        onChange={(e) => updateFilters('term', e.target.value)}
        className="py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-slate-700 font-bold"
      >
        <option value="all">All Terms</option>
        <option value="1st Term">1st Term</option>
        <option value="2nd Term">2nd Term</option>
        <option value="3rd Term">3rd Term</option>
      </select>

      <select 
        value={currentWeek}
        onChange={(e) => updateFilters('week', e.target.value)}
        className="py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-slate-700 font-bold"
      >
        <option value="">All Weeks</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(week => (
          <option key={week} value={week.toString()}>Week {week}</option>
        ))}
      </select>
    </div>
  );
}
