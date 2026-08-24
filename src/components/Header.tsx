import React from 'react';
import { 
  Eye, 
  Code2, 
  Sparkles, 
  Download, 
  Database, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Shield,
  LayoutDashboard,
  Settings,
  UserCheck
} from 'lucide-react';
import { DashboardSpec, DashboardTheme, ValidationResult } from '../core/types';
import { UserRole } from '../core/authTypes';

interface HeaderProps {
  spec: DashboardSpec | null;
  currentDashboardKey: string;
  onSelectDashboard: (key: string) => void;
  viewMode: 'viewer' | 'editor';
  onToggleViewMode: (mode: 'viewer' | 'editor') => void;
  showEditor: boolean;
  onToggleEditor: () => void;
  showCopilot: boolean;
  onToggleCopilot: () => void;
  onOpenDataSources: () => void;
  onOpenExport: () => void;
  onOpenAdmin: () => void;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  validation: ValidationResult;
  theme: DashboardTheme;
  onChangeTheme: (theme: DashboardTheme) => void;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  spec,
  currentDashboardKey,
  onSelectDashboard,
  viewMode,
  onToggleViewMode,
  showEditor,
  onToggleEditor,
  showCopilot,
  onToggleCopilot,
  onOpenDataSources,
  onOpenExport,
  onOpenAdmin,
  userRole,
  onChangeUserRole,
  validation,
  theme,
  onChangeTheme,
  viewport,
  onChangeViewport,
  onReset
}) => {
  const canEdit = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 shrink-0 select-none">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                THE EYE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              seven-eleven-qlik-bq • Google ADC
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        {/* View Mode Toggle: Dashboard Viewer vs Studio Editor */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-bold">
          <button
            onClick={() => onToggleViewMode('viewer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              viewMode === 'viewer' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard View</span>
          </button>

          {canEdit && (
            <button
              onClick={() => onToggleViewMode('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === 'editor' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Studio / Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Device Viewport Switcher */}
      <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5 text-slate-400">
        <button
          onClick={() => onChangeViewport('desktop')}
          title="Desktop View"
          className={`p-1.5 rounded-md transition ${viewport === 'desktop' ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' : 'hover:text-slate-200'}`}
        >
          <Laptop className="w-4 h-4" />
        </button>
        <button
          onClick={() => onChangeViewport('tablet')}
          title="Tablet View"
          className={`p-1.5 rounded-md transition ${viewport === 'tablet' ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' : 'hover:text-slate-200'}`}
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          onClick={() => onChangeViewport('mobile')}
          title="Mobile View"
          className={`p-1.5 rounded-md transition ${viewport === 'mobile' ? 'bg-cyan-500/20 text-cyan-400 shadow-sm' : 'hover:text-slate-200'}`}
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Right Actions & RBAC Switcher */}
      <div className="flex items-center gap-2">
        {/* Role Switcher Pill */}
        <select
          value={userRole}
          onChange={(e) => onChangeUserRole(e.target.value as UserRole)}
          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer transition ${
            userRole === 'owner' 
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
              : userRole === 'editor' 
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
              : 'bg-slate-900 text-slate-300 border-slate-800'
          }`}
          title="Simulate Role / Permissions"
        >
          <option value="owner">👑 Role: Owner</option>
          <option value="editor">✏️ Role: Editor</option>
          <option value="viewer">👁️ Role: Viewer</option>
        </select>

        {/* Admin Console (Owner Only) */}
        {isOwner && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 transition"
            title="SSO & Admin Console"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin & SSO</span>
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* AI Copilot Toggle (Only for Editors & Owners) */}
        {canEdit && viewMode === 'editor' && (
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              showCopilot 
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 border-cyan-400/50 text-white shadow-lg shadow-cyan-500/25' 
                : 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Copilot</span>
          </button>
        )}
      </div>
    </header>
  );
};
