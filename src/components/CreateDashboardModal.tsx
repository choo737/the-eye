import React, { useState } from 'react';
import { X, Plus, Database, Sparkles, LayoutGrid } from 'lucide-react';
import { DashboardMetadata } from '../core/dashboardRegistry';

interface CreateDashboardModalProps {
  currentUserEmail: string;
  currentUserName: string;
  onCreate: (newDashboard: DashboardMetadata) => void;
  onClose: () => void;
}

export const CreateDashboardModal: React.FC<CreateDashboardModalProps> = ({
  currentUserEmail,
  currentUserName,
  onCreate,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dataSource, setDataSource] = useState('seven-eleven-qlik-bq');
  const [datasetName, setDatasetName] = useState('retail_analytics');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 32) + '-' + Date.now().toString().slice(-4);
    
    // Generate starter YAML
    const initialYaml = `version: "1.0"
id: "${id}"
title: "${title}"
description: "${description || 'Declarative BI Dashboard created via The Eye Studio'}"
theme: "emerald-slate"
refresh_interval: "30s"

data_sources:
  - id: bq_source
    name: "BigQuery (${dataSource})"
    type: bigquery
    project: "${dataSource}"
    dataset: "${datasetName}"
    options:
      auth_mode: "google_oauth_adc_delegated"

filters:
  - id: store_region
    label: "Store Region"
    type: multi_select
    default: ["All Regions"]
    options:
      - label: "All Regions"
        value: "All Regions"
      - label: "Klang Valley / Central"
        value: "Klang Valley / Central"
      - label: "Northern Region"
        value: "Northern Region"
      - label: "Southern Region"
        value: "Southern Region"

  - id: time_range
    label: "Time Horizon"
    type: daterange
    default: "2026-YTD"

layout:
  columns: 12

widgets:
  - id: kpi_primary_sales
    title: "Gross Sales Volume"
    type: kpi_card
    source: bq_source
    position: { x: 0, y: 0, w: 4, h: 2 }
    value: "gross_sales"
    format: "$0.00a"
    comparison_label: "+14.2% YoY"
    sparkline: true

  - id: kpi_active_outlets
    title: "Active Outlets"
    type: kpi_card
    source: bq_source
    position: { x: 4, y: 0, w: 4, h: 2 }
    value: "store_count"
    format: "0,0"
    comparison_label: "+12 new openings"
    sparkline: true

  - id: kpi_avg_basket
    title: "Average Basket Size"
    type: kpi_card
    source: bq_source
    position: { x: 8, y: 0, w: 4, h: 2 }
    value: "basket_size"
    format: "$0.00"
    comparison_label: "+$1.85 / basket"
    sparkline: true

  - id: velocity_trend
    title: "POS Transaction Velocity & Footfall"
    subtitle: "Showing {{active_grain}} stream for {{time_range}}"
    type: line_chart
    source: bq_source
    position: { x: 0, y: 2, w: 8, h: 4 }
    x: "date"
    y: ["Store Sales ($)", "Customer Count"]
    dual_axis: true
    auto_grain: true
    smooth: true

  - id: regional_breakdown_bar
    title: "Regional Sales Contribution"
    subtitle: "Actual vs Target across Store Clusters"
    type: bar_chart
    source: bq_source
    position: { x: 8, y: 2, w: 4, h: 4 }
    x: "cluster"
    y: ["Actual Revenue", "Target Revenue"]
`;

    const newDash: DashboardMetadata = {
      id,
      title,
      description: description || 'Declarative Dashboard as Code',
      dataSource: `${dataSource}.${datasetName}`,
      dataSourceType: 'bigquery',
      ownerEmail: currentUserEmail,
      ownerName: currentUserName,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'Just now',
      yaml: initialYaml,
      permissions: {
        [currentUserEmail]: 'owner'
      },
      tags: ['BigQuery', 'Custom Dashboard', 'Author: ' + currentUserName]
    };

    onCreate(newDash);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Declarative Dashboard</h2>
              <p className="text-xs text-slate-400">You will be designated as the Owner of this dashboard</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Dashboard Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 7-Eleven Q3 Executive Performance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief description of the dashboard objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">GCP Project</label>
              <input
                type="text"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">BigQuery Dataset</label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Create Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
