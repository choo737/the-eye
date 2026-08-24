import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Presentation, FileText, Share2, Check, ExternalLink } from 'lucide-react';
import { DashboardSpec } from '../core/types';
import { exportDashboardToPowerPoint } from '../exporters/powerPointExporter';
import { exportDashboardToExcel } from '../exporters/excelExporter';
import { generateGoogleWorkspaceReport } from '../exporters/googleWorkspaceExporter';

interface ExportModalProps {
  spec: DashboardSpec;
  activeFilters: Record<string, any>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ spec, activeFilters, onClose }) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExportPowerPoint = async () => {
    try {
      setExporting('pptx');
      const filename = await exportDashboardToPowerPoint(spec, activeFilters);
      setSuccessMsg(`✅ Downloaded presentation: ${filename}`);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = () => {
    try {
      setExporting('xlsx');
      const filename = exportDashboardToExcel(spec, activeFilters);
      setSuccessMsg(`✅ Downloaded Excel workbook: ${filename}`);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  const handleCopyGoogleDocs = () => {
    const md = generateGoogleWorkspaceReport(spec, activeFilters);
    navigator.clipboard.writeText(md);
    setSuccessMsg('✅ Copied Google Docs / Slides markdown report to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export & Ecosystem Integrations</h2>
              <p className="text-xs text-slate-400">Export native files for Microsoft 365 and Google Workspace</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Microsoft 365 Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span>🏢 Microsoft 365 Integrations</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportPowerPoint}
                disabled={exporting === 'pptx'}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-950/10 p-4 rounded-xl text-left transition flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Presentation className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Microsoft PowerPoint (.pptx)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Generate executive presentation slides with native charts</p>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={exporting === 'xlsx'}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 p-4 rounded-xl text-left transition flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Microsoft Excel (.xlsx)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Multi-tab workbook with formulas, KPIs, and data sheets</p>
                </div>
              </button>
            </div>
          </div>

          {/* Google Workspace Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <span>🌐 Google Workspace Integrations</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleCopyGoogleDocs}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/10 p-4 rounded-xl text-left transition flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Google Docs & Slides Report</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Copy formatted Markdown briefing report for Docs / Slides</p>
                </div>
              </button>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Google Sheets Live Sync</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Data source linked directly via Google Sheets API</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
