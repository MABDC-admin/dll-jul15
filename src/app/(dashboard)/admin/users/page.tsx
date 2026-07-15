import { prisma } from '@/lib/prisma';
import { UserCheck } from 'lucide-react';
import CreateUserModal from './CreateUserModal';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-slate-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">System Users Directory</h3>
              <p className="text-xs text-slate-400">Manage all portal identities and active roles.</p>
            </div>
          </div>
          <CreateUserModal />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Role Privileges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{user.id.slice(0, 12)}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{user.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      user.role === 'PRINCIPAL' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-indigo-600 font-bold hover:underline">Edit</button>
                    <span className="mx-2 text-slate-300">|</span>
                    <button className="text-rose-600 font-bold hover:underline">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
