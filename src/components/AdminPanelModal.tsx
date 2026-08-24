import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Key, 
  Users, 
  Database, 
  Check, 
  Save, 
  Lock, 
  Globe, 
  UserCheck, 
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { SsoConfig, UserManagementEntry, UserRole } from '../core/authTypes';

interface AdminPanelModalProps {
  onClose: () => void;
  currentUserRole: UserRole;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ onClose, currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<'sso' | 'users' | 'bigquery'>('sso');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // SSO Settings State
  const [ssoConfig, setSsoConfig] = useState<SsoConfig>({
    provider: 'google',
    clientId: '849201948201-abc123googleusercontent.apps.googleusercontent.com',
    clientSecret: 'GOCSPX-****************************',
    allowedDomains: ['jackychoo.altostrat.com', 'google.com', '7-eleven.com.my'],
    enforceHostedDomain: true,
    defaultRole: 'viewer',
    enabled: true
  });

  const [newDomainInput, setNewDomainInput] = useState('');

  // User Management State (RBAC)
  const [users, setUsers] = useState<UserManagementEntry[]>([
    { id: '1', email: 'admin@jackychoo.altostrat.com', name: 'Jacky Choo', role: 'owner', status: 'active', lastActive: 'Just now' },
    { id: '2', email: 'executive-lead@7-eleven.com.my', name: 'VP Retail Operations', role: 'editor', status: 'active', lastActive: '2h ago' },
    { id: '3', email: 'store-manager@7-eleven.com.my', name: 'Store Operations Team', role: 'viewer', status: 'active', lastActive: '1d ago' },
    { id: '4', email: 'board-member@corp.com', name: 'Board Audit Committee', role: 'viewer', status: 'active', lastActive: '3d ago' }
  ]);

  const handleSaveSso = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleAddDomain = () => {
    if (newDomainInput.trim() && !ssoConfig.allowedDomains.includes(newDomainInput.trim())) {
      setSsoConfig(prev => ({ ...prev, allowedDomains: [...prev.allowedDomains, newDomainInput.trim()] }));
      setNewDomainInput('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setSsoConfig(prev => ({ ...prev, allowedDomains: prev.allowedDomains.filter(d => d !== domain) }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">Enterprise Administration & Security</h2>
              <p className="text-xs text-slate-400">Configure Google SSO, IAM Credential Authority, and User Roles</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('sso')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'sso' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Google SSO & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'users' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Roles & RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab('bigquery')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'bigquery' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>BigQuery Project IAM</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Configuration successfully saved and deployed to authentication authority!</span>
            </div>
          )}

          {/* TAB 1: SSO CONFIGURATION */}
          {activeTab === 'sso' && (
            <form onSubmit={handleSaveSso} className="space-y-5">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Google OAuth 2.0 Single Sign-On</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={ssoConfig.enabled}
                      onChange={(e) => setSsoConfig({ ...ssoConfig, enabled: e.target.checked })}
                      className="rounded border-slate-800 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-slate-950"
                    />
                    <span>Enforce SSO Login</span>
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Google OAuth Client ID</label>
                    <input
                      type="text"
                      value={ssoConfig.clientId}
                      onChange={(e) => setSsoConfig({ ...ssoConfig, clientId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Client Secret (Encrypted Vault)</label>
                    <input
                      type="password"
                      value={ssoConfig.clientSecret}
                      onChange={(e) => setSsoConfig({ ...ssoConfig, clientSecret: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Allowed Hosted Domains */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Authorized Workspace Domains (hd restriction)</h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Zero Trust Enforced</span>
                </div>

                <p className="text-xs text-slate-400">
                  Only authenticated users with Google email addresses from these corporate domains will be granted access:
                </p>

                <div className="flex flex-wrap gap-2">
                  {ssoConfig.allowedDomains.map((domain) => (
                    <span key={domain} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1 rounded-lg text-xs font-mono">
                      <span>@{domain}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDomain(domain)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add domain e.g. company.com"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDomain}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Domain
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition"
                >
                  <Save className="w-4 h-4" /> Save SSO Configurations
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: USER MANAGEMENT & RBAC */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Role-Based Access Control (RBAC) Matrix</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control Owner, Editor, and Viewer permissions across all dashboards</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Assigned Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Active</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-850/60 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold border focus:outline-none cursor-pointer ${
                              user.role === 'owner' 
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                                : user.role === 'editor' 
                                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <option value="owner" className="bg-slate-900 text-amber-300">👑 Owner (Full Admin)</option>
                            <option value="editor" className="bg-slate-900 text-cyan-300">✏️ Editor (Studio & Code)</option>
                            <option value="viewer" className="bg-slate-900 text-slate-300">👁️ Viewer (Read-Only Dash)</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{user.lastActive}</td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs text-rose-400 hover:text-rose-300 font-medium">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BIGQUERY IAM STATUS */}
          {activeTab === 'bigquery' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">GCP BigQuery Authority Status</h3>
                      <p className="text-[11px] text-slate-400">Target Authority: <span className="font-mono text-cyan-300 font-bold">Enterprise Cloud IAM</span></p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> ADC Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">Active ADC Credential</span>
                    <span className="text-xs font-mono text-slate-200 font-bold">admin@jackychoo.altostrat.com</span>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">IAM Permission Scope</span>
                    <span className="text-xs font-mono text-emerald-300 font-bold">roles/bigquery.jobUser + dataViewer</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
