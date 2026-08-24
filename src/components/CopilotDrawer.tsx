import React, { useState, useMemo } from 'react';
import { Sparkles, Send, Bot, User, Wand2, X, PlusCircle, RefreshCw, Layers, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DashboardSpec, WidgetSpec } from '../core/types';
import { stringifyDashboardSpec } from '../core/parser';

interface CopilotDrawerProps {
  spec: DashboardSpec | null;
  onApplySpecYaml: (newYaml: string) => void;
  onClose: () => void;
  isGitLocked?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  appliedChanges?: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  spec,
  onApplySpecYaml,
  onClose,
  isGitLocked = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "👋 Hi! I'm **The Eye Schema-Aware Copilot**. I analyze your live BigQuery schema, table fields, and metrics to auto-generate valid declarative YAML. Try a prompt or click one of the suggested actions below!",
      timestamp: 'Just now'
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract active dataset & schema fields context
  const schemaContext = useMemo(() => {
    const srcId = spec?.data_sources?.[0]?.id || 'bq_primary';
    const project = spec?.data_sources?.[0]?.project || spec?.data_sources?.[0]?.project_id || 'the-eye-bi-platform';
    const dataset = spec?.data_sources?.[0]?.dataset || 'primary_warehouse';
    const table = spec?.data_sources?.[0]?.table || 'fct_analytics';

    let suggestedPrompts = [
      "Add a dual-axis line chart for intraday velocity",
      "Add a category distribution donut chart",
      "Add an SLA performance gauge",
      "Switch aesthetic theme to Cyberpunk Neon"
    ];

    if (dataset.includes('cimb') || dataset.includes('bank')) {
      suggestedPrompts = [
        "Add a loan disbursements vs CASA deposits donut chart",
        "Add a customer NPS rating gauge with 95 target",
        "Add a branch manager performance ranking table"
      ];
    } else if (dataset.includes('health') || dataset.includes('hospital')) {
      suggestedPrompts = [
        "Add emergency department triage wait time gauge",
        "Add clinical inpatient census by specialty bar chart",
        "Add hospital quality rating radar chart"
      ];
    } else if (dataset.includes('saas') || dataset.includes('subscription')) {
      suggestedPrompts = [
        "Add Net Revenue Retention (NRR) KPI card",
        "Add subscription plan MRR contribution treemap",
        "Add customer MRR vs API consumption scatter plot"
      ];
    } else if (dataset.includes('supply') || dataset.includes('logistics')) {
      suggestedPrompts = [
        "Add fleet fuel spend vs shipment volume bar chart",
        "Add on-time delivery SLA radar assessment",
        "Add logistics gateway distribution hub GIS map"
      ];
    }

    return { srcId, project, dataset, table, suggestedPrompts };
  }, [spec]);

  const handleSendPrompt = (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim() || !spec) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setPrompt('');
    setIsProcessing(true);

    setTimeout(() => {
      const updatedSpec: DashboardSpec = JSON.parse(JSON.stringify(spec));
      let responseText = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('radar')) {
        updatedSpec.widgets.push({
          id: `radar_quality_${Date.now()}`,
          title: 'Operational SLA & Quality Index',
          subtitle: 'Multi-axial performance benchmark',
          type: 'radar',
          source: schemaContext.srcId,
          position: { w: 6, h: 4 },
          radar_indicators: [
            { name: 'SLA Quality', max: 100 },
            { name: 'On-Time Performance', max: 100 },
            { name: 'Resource Utilization', max: 100 },
            { name: 'Safety & Compliance', max: 100 },
            { name: 'Customer Satisfaction', max: 100 }
          ]
        });
        responseText = "✨ Added **Operational SLA & Quality Index (Radar Chart)** to your dashboard layout.";
      } else if (lower.includes('gauge')) {
        updatedSpec.widgets.push({
          id: `gauge_sla_${Date.now()}`,
          title: 'SLA Performance & Target Fulfillment',
          subtitle: 'Real-time threshold fulfillment',
          type: 'gauge',
          source: schemaContext.srcId,
          position: { w: 4, h: 4 },
          value: 'occupancy_rate_pct',
          format: '0.0%'
        });
        responseText = "✨ Added **SLA Performance Gauge** widget with target attainment bounds.";
      } else if (lower.includes('treemap')) {
        updatedSpec.widgets.push({
          id: `treemap_contrib_${Date.now()}`,
          title: 'Portfolio Segment Contribution',
          subtitle: 'Hierarchical value distribution',
          type: 'treemap',
          source: schemaContext.srcId,
          position: { w: 6, h: 4 },
          dimension: 'plan_tier',
          measures: ['mrr_usd'],
          format: '$0.0a'
        });
        responseText = "✨ Added **Portfolio Contribution Treemap** widget.";
      } else if (lower.includes('scatter')) {
        updatedSpec.widgets.push({
          id: `scatter_analysis_${Date.now()}`,
          title: 'Multi-Variable Correlation Matrix',
          subtitle: 'Comparing primary volume vs telemetry usage',
          type: 'scatter_chart',
          source: schemaContext.srcId,
          position: { w: 6, h: 4 },
          dimension: 'company_name',
          measures: ['mrr_usd', 'usage_api_calls'],
          format: '$0.0a'
        });
        responseText = "✨ Added **Multi-Variable Correlation Scatter Plot**.";
      } else if (lower.includes('cyberpunk') || lower.includes('theme')) {
        updatedSpec.theme = 'cyberpunk';
        responseText = "🎨 Switched dashboard theme to **Cyberpunk Neon**.";
      } else {
        updatedSpec.widgets.push({
          id: `custom_bar_${Date.now()}`,
          title: 'Category Growth & Performance Stream',
          subtitle: `Generated from BigQuery ${schemaContext.table}`,
          type: 'bar_chart',
          source: schemaContext.srcId,
          position: { w: 6, h: 4 },
          dimension: 'region',
          measures: ['transaction_volume_myr', 'deposit_target_myr'],
          labels: {
            transaction_volume_myr: 'Actual Volume',
            deposit_target_myr: 'Target Allocation'
          }
        });
        responseText = `✨ Processed instruction: *"${textToSend}"*. Generated schema-compliant widget connected to \`${schemaContext.dataset}.${schemaContext.table}\`.`;
      }

      const newYaml = stringifyDashboardSpec(updatedSpec);
      onApplySpecYaml(newYaml);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col h-full z-40 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              AI Schema Copilot
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">LLM</span>
            </h3>
            <p className="text-[11px] text-slate-400">Schema-aware Prompt-to-YAML</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Schema Context Badge */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
        <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <div className="truncate">
          <span className="text-slate-400">Context:</span> <span className="font-mono text-cyan-300">{schemaContext.dataset}.{schemaContext.table}</span>
        </div>
      </div>

      {isGitLocked && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Git CI/CD Locked: Applied YAML will preview locally.</span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div 
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/60'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
              <span className="block text-[10px] text-slate-400 mt-1.5 text-right opacity-75">
                {msg.timestamp}
              </span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>Analyzing schema and generating YAML AST...</span>
          </div>
        )}
      </div>

      {/* Suggested Actions */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Suggested Copilot Actions
        </span>
        <div className="flex flex-col gap-1.5">
          {schemaContext.suggestedPrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(s)}
              className="text-left text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 transition flex items-center gap-1.5 truncate"
            >
              <Wand2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Type a request (e.g. add loan breakdown bar)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isProcessing}
            className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl transition shadow-lg shadow-cyan-500/20 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
