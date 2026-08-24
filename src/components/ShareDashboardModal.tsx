import React, { useState } from 'react';
import { X, Share2, UserPlus, Shield, Trash2, Check, User } from 'lucide-react';
import { DashboardMetadata } from '../core/dashboardRegistry';
import { UserRole } from '../core/authTypes';

interface ShareDashboardModalProps {
  dashboard: DashboardMetadata;
  currentUserEmail: string;
  onUpdatePermissions: (dashboardId: string, updatedPermissions: Record<string, 'owner' | 'editor' | 'viewer'>) => void;
  onClose: () => void;
}

export const ShareDashboardModal: React.FC<ShareDashboardModalProps> = ({
  dashboard,
  currentUserEmail,
  onUpdatePermissions,
  onClose
}) => {
  const [permissions, setPermissions] = useState<Record<string, 'owner' | 'editor' | 'viewer'>>({ ...dashboard.permissions });
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'editor' | 'viewer'>('viewer');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    const emailTrimmed = newEmail.trim().toLowerCase();
    
    setPermissions(prev => ({
      ...prev,
      [emailTrimmed]: newRole
    }));
    setNewEmail('');
  };

  const handleRoleChange = (email: string, role: 'owner' | 'editor' | 'viewer') => {
    setPermissions(prev => ({ ...prev, [email]: role }));
  };

  const handleRemoveUser = (email: string) => {
    if (email === dashboard.ownerEmail) return; // Cannot remove owner
    setPermissions(prev => {
      const copy = { ...prev };
      delete copy[email];
      return copy;
    });
  };

  const handleSave = () => {
    onUpdatePermissions(dashboard.id, permissions);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Share Dashboard & Manage Access</h2>
              <p className="text-xs text-slate-400 truncate max-w-sm">{dashboard.title}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Permissions successfully updated and deployed!</span>
            </div>
          )}

          {/* Add user form */}
          <form onSubmit={handleAddUser} className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Grant User Access</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none"
              >
                <option value="editor">✏️ Editor (Can edit code)</option>
                <option value="viewer">👁️ Viewer (Read only)</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </form>

          {/* Access list */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Users With Access ({Object.keys(permissions).length})</span>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
              {Object.entries(permissions).map(([email, role]) => {
                const isOwner = email === dashboard.ownerEmail;
                return (
                  <div key={email} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">{email}</div>
                        {isOwner && <span className="text-[10px] text-amber-400 font-mono">Original Dashboard Creator</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isOwner ? (
                        <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                          👑 Owner
                        </span>
                      ) : (
                        <>
                          <select
                            value={role}
                            onChange={(e) => handleRoleChange(email, e.target.value as any)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none"
                          >
                            <option value="editor">✏️ Editor</option>
                            <option value="viewer">👁️ Viewer</option>
                          </select>
                          <button
                            onClick={() => handleRemoveUser(email)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Remove Access"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition"
          >
            Save Access Permissions
          </button>
        </div>
      </div>
    </div>
  );
};
