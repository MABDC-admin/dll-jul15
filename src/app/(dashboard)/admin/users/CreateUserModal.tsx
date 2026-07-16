'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createUser } from './actions';
import { Plus, X } from 'lucide-react';

export default function CreateUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createUser(formData);
      toast.success("User provisioned successfully.");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create user.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-slate-800 text-white hover:bg-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
        <Plus className="w-4 h-4" /> Provision New User
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">Provision New User</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Full Name</label>
                <input required name="name" type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Email Address</label>
                <input required name="email" type="email" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Role</label>
                <select required name="role" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                  <option value="TEACHER">Teacher</option>
                  <option value="PRINCIPAL">Academic Director</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Temporary Password</label>
                <input required name="password" type="text" defaultValue="Denskie123" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button disabled={isPending} type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50">
                  {isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
