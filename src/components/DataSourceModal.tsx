import React, { useState } from 'react';
import { X, Database, CheckCircle2, Plus, Server, FileSpreadsheet, Cloud, RefreshCw } from 'lucide-react';
import { DataSourceSpec } from '../core/types';

interface DataSourceModalProps {
  sources: DataSourceSpec[];
  onClose: () => void;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({ sources, onClose }) => {
  const [activeTab, setActiveTab] = useState<'connected' | 'add'>('connected');

  const connectorCatalog = [
    { type: 'bigquery', name: 'Google BigQuery', icon: '☁️', category: 'Cloud Warehouse', desc: 'Direct push-down SQL execution over petabyte datasets' },
    { type: 'snowflake', name: 'Snowflake', icon: '❄️', category: 'Cloud Warehouse', desc: 'Native compute warehouse connector with OAuth / Keypair' },
    { type: 'databricks', name: 'Databricks Lakehouse', icon: '🧱', category: 'Lakehouse', desc: 'Delta Lake & Spark SQL query execution' },
    { type: 'postgres', name: 'PostgreSQL', icon: '🐘', category: 'RDBMS', desc: 'High-performance connection pooling & streaming results' },
    { type: 'mysql', name: 'MySQL', icon: '🐬', category: 'RDBMS', desc: 'Native MySQL protocol & Amazon Aurora support' },
    { type: 'mssql', name: 'Microsoft SQL Server', icon: '🏢', category: 'RDBMS', desc: 'Azure SQL and enterprise on-premise MSSQL' },
    { type: 'google_sheet', name: 'Google Sheets', icon: '📊', category: 'Google Workspace', desc: 'Live bi-directional range sync & formula calculation' },
    { type: 'excel', name: 'Microsoft Excel (.xlsx)', icon: '📗', category: 'Microsoft 365', desc: 'Direct workbook parser & virtual SQL table extractor' },
    { type: 'duckdb', name: 'DuckDB In-Memory OLAP', icon: '🦆', category: 'Fast OLAP', desc: 'Lightning fast client-side SQL execution over Parquet & CSV' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Universal Data Connectors</h2>
              <p className="text-xs text-slate-400">Enterprise Warehouse, Database, and Workspace Connectors</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Active Dashboard Data Sources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sources.map((src) => (
                <div key={src.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Server className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{src.name || src.id}</h4>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">type: {src.type}</p>
                    {src.warehouse && <p className="text-[10px] text-slate-500">WH: {src.warehouse}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Available Connector Ecosystem</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {connectorCatalog.map((c) => (
                <div key={c.type} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{c.icon}</span>
                      <h4 className="text-xs font-bold text-slate-200">{c.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">{c.category}</span>
                    <button className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex justify-end">
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
