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
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DashboardSpec, DashboardTheme, ValidationResult } from '../core/types';
import { SAMPLE_DASHBOARDS } from '../core/sampleDashboards';

interface HeaderProps {
  spec: DashboardSpec | null;
  currentDashboardKey: string;
  onSelectDashboard: (key: string) => void;
  showEditor: boolean;
  onToggleEditor: () => void;
  showCopilot: boolean;
  onToggleCopilot: () => void;
  onOpenDataSources: () => void;
  onOpenExport: () => void;
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
  showEditor,
  onToggleEditor,
  showCopilot,
  onToggleCopilot,
  onOpenDataSources,
  onOpenExport,
  validation,
  theme,
  onChangeTheme,
  viewport,
  onChangeViewport,
  onReset
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 shrink-0 select-none">
      {/* Brand & Dashboard Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                THE EYE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                BI AS CODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Declarative • LLM-Native • Universal Connectors
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        {/* Dashboard Preset Selector */}
        <select
          value={currentDashboardKey}
          onChange={(e) => onSelectDashboard(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:border-slate-700 transition"
        >
          {Object.entries(SAMPLE_DASHBOARDS).map(([key, item]) => (
            <option key={key} value={key}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Schema Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs">
          {validation.valid ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Spec Valid
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {validation.errors.length} Errors
            </span>
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

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Data Sources Button */}
        <button
          onClick={onOpenDataSources}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition"
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Connectors</span>
        </button>

        {/* Export / Integrations Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Export & Integrations</span>
        </button>

        {/* YAML Code Editor Toggle */}
        <button
          onClick={onToggleEditor}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
            showEditor 
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10' 
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>YAML Code</span>
        </button>

        {/* AI Copilot Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            showCopilot 
              ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 border-cyan-400/50 text-white shadow-lg shadow-cyan-500/25' 
              : 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span>AI Copilot</span>
        </button>
      </div>
    </header>
  );
};
