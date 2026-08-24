import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  Share2, 
  Trash2, 
  Eye, 
  Code2, 
  Clock, 
  Database, 
  User, 
  Shield, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { DashboardMetadata } from '../core/dashboardRegistry';
import { UserRole } from '../core/authTypes';
import { ShareDashboardModal } from './ShareDashboardModal';
import { CreateDashboardModal } from './CreateDashboardModal';

interface DashboardHubProps {
  dashboards: DashboardMetadata[];
  currentUserEmail: string;
  currentUserName: string;
  currentUserRole: UserRole;
  onOpenDashboard: (dashboard: DashboardMetadata, mode: 'viewer' | 'editor') => void;
  onCreateDashboard: (newDashboard: DashboardMetadata) => void;
  onUpdatePermissions: (dashboardId: string, permissions: Record<string, 'owner' | 'editor' | 'viewer'>) => void;
  onDeleteDashboard: (dashboardId: string) => void;
}

export const DashboardHub: React.FC<DashboardHubProps> = ({
  dashboards,
  currentUserEmail,
  currentUserName,
  currentUserRole,
  onOpenDashboard,
  onCreateDashboard,
  onUpdatePermissions,
  onDeleteDashboard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'mine' | 'shared'>('all');
  const [sharingDashboard, setSharingDashboard] = useState<DashboardMetadata | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreate = currentUserRole === 'owner' || currentUserRole === 'editor';

  const filteredDashboards = dashboards.filter((d) => {
    const userRoleOnDash = d.permissions[currentUserEmail] || (currentUserRole === 'owner' ? 'owner' : 'viewer');
    const isOwner = d.ownerEmail === currentUserEmail || userRoleOnDash === 'owner';

    if (filterTab === 'mine' && !isOwner) return false;
    if (filterTab === 'shared' && isOwner) return false;

    if (!searchTerm) return true;
    return (
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dataSource.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Workspace Portal
              </span>
              <span className="text-xs text-slate-500 font-mono">Data Sources Connected: {dashboards.length}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Dashboards & Business Intelligence Hub
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage, develop, and share your organization's declarative dashboards
            </p>
          </div>

          {/* Create Button (Developer / Editor Permission) */}
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Dashboard</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 text-xs font-semibold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${filterTab === 'all' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              All Dashboards ({dashboards.length})
            </button>
            <button
              onClick={() => setFilterTab('mine')}
              className={`px-3 py-1.5 rounded-lg transition ${filterTab === 'mine' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Created by Me
            </button>
            <button
              onClick={() => setFilterTab('shared')}
              className={`px-3 py-1.5 rounded-lg transition ${filterTab === 'shared' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Shared with Me
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dashboards by name or data source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-full sm:w-72"
            />
          </div>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDashboards.map((dash) => {
            const userRoleOnDash = dash.permissions[currentUserEmail] || (currentUserRole === 'owner' ? 'owner' : 'viewer');
            const isOwner = dash.ownerEmail === currentUserEmail || userRoleOnDash === 'owner';
            const isEditor = userRoleOnDash === 'editor' || isOwner;

            return (
              <div
                key={dash.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isOwner 
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                            : isEditor 
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {isOwner ? '👑 Owner' : isEditor ? '✏️ Editor' : '👁️ Viewer'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOwner && (
                        <button
                          onClick={() => setSharingDashboard(dash)}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition"
                          title="Manage Access & Permissions"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isOwner && dashboards.length > 1 && (
                        <button
                          onClick={() => onDeleteDashboard(dash.id)}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                          title="Delete Dashboard"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition">
                    {dash.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {dash.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono text-[11px] text-slate-300">{dash.dataSource}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{dash.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{dash.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenDashboard(dash, 'viewer')}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>View Dashboard</span>
                  </button>

                  {isEditor && (
                    <button
                      onClick={() => onOpenDashboard(dash, 'editor')}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Code2 className="w-4 h-4" />
                      <span>Edit YAML Spec</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share / Access Control Modal */}
      {sharingDashboard && (
        <ShareDashboardModal
          dashboard={sharingDashboard}
          currentUserEmail={currentUserEmail}
          onUpdatePermissions={onUpdatePermissions}
          onClose={() => setSharingDashboard(null)}
        />
      )}

      {/* Create Dashboard Modal */}
      {showCreateModal && (
        <CreateDashboardModal
          currentUserEmail={currentUserEmail}
          currentUserName={currentUserName}
          onCreate={onCreateDashboard}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
