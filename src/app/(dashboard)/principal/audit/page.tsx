import { prisma } from '@/lib/prisma';
import { ShieldAlert } from 'lucide-react';

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <ShieldAlert className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">System Audit Trail</h3>
            <p className="text-xs text-slate-400">Chronological history of major system modifications.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{log.timestamp.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">{log.user}</td>
                  <td className="py-3.5 px-4 text-slate-600">{log.action}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                      {log.type.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">
                    No audit logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
