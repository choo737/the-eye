import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Wand2, X, PlusCircle, RefreshCw, Layers } from 'lucide-react';
import { DashboardSpec } from '../core/types';
import { stringifyDashboardSpec } from '../core/parser';

interface CopilotDrawerProps {
  spec: DashboardSpec | null;
  onApplySpecYaml: (newYaml: string) => void;
  onClose: () => void;
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
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "👋 Hi Jacky! I'm **The Eye Copilot**. I can add new charts, bind multi-source databases, optimize queries, create cross-filters, and export decks. Try prompting me or clicking one of the shortcuts below!",
      timestamp: 'Just now'
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      // Simulate intelligent LLM YAML editing agent
      const updatedSpec: DashboardSpec = JSON.parse(JSON.stringify(spec));
      let responseText = '';

      if (textToSend.toLowerCase().includes('radar') || textToSend.toLowerCase().includes('supply')) {
        updatedSpec.widgets.push({
          id: 'supply_chain_radar',
          title: 'Supply Chain & Fulfillment Score',
          subtitle: 'Inventory velocity vs stockouts',
          type: 'radar',
          source: spec.data_sources[0]?.id || 'mock',
          position: { w: 6, h: 4 }
        });
        responseText = "✨ Added **Supply Chain & Fulfillment Score (Radar Chart)** to your dashboard layout.";
      } else if (textToSend.toLowerCase().includes('kpi') || textToSend.toLowerCase().includes('margin')) {
        updatedSpec.widgets.unshift({
          id: 'kpi_gross_margin',
          title: 'Gross Margin %',
          type: 'kpi_card',
          source: spec.data_sources[0]?.id || 'mock',
          position: { w: 3, h: 2 },
          value: 'margin_pct',
          format: '0.0%',
          comparison_label: '+4.5% QoQ',
          sparkline: true
        });
        responseText = "✨ Added **Gross Margin % KPI Scorecard** to the top metrics row.";
      } else if (textToSend.toLowerCase().includes('dark') || textToSend.toLowerCase().includes('cyberpunk')) {
        updatedSpec.theme = 'cyberpunk';
        responseText = "🎨 Switched dashboard aesthetic theme to **Cyberpunk Neon**.";
      } else {
        // Generic smart modification
        updatedSpec.widgets.push({
          id: `custom_chart_${Date.now()}`,
          title: 'Segment Velocity & Growth',
          subtitle: 'Generated via AI Copilot agent',
          type: 'bar_chart',
          source: spec.data_sources[0]?.id || 'mock',
          position: { w: 6, h: 4 },
          x: 'segment',
          y: ['Growth %', 'Contribution']
        });
        responseText = `✨ I have processed your request: *"${textToSend}"*. Added an optimized visual widget and updated the declarative YAML schema.`;
      }

      const newYaml = stringifyDashboardSpec(updatedSpec);
      onApplySpecYaml(newYaml);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        appliedChanges: 'Updated dashboard.yaml schema'
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 900);
  };

  return (
    <div className="w-[380px] sm:w-[420px] border-l border-slate-800 bg-slate-950 flex flex-col shrink-0 h-full z-20 shadow-2xl">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">AI Copilot</h3>
            <p className="text-[10px] text-cyan-400 font-medium">Dashboard as Code Agent</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
            }`}>
              <div className="prose prose-invert prose-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              {msg.appliedChanges && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-cyan-400 font-mono">
                  <Wand2 className="w-3 h-3" />
                  <span>{msg.appliedChanges}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 items-center text-xs text-slate-400 italic">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Analyzing YAML schema & generating diff...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/40">
        <p className="text-[11px] font-semibold text-slate-400 mb-2">⚡ Quick Actions</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSendPrompt("Add a Gross Margin KPI metric")}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg transition text-left"
          >
            + Gross Margin KPI
          </button>
          <button
            onClick={() => handleSendPrompt("Add a Supply Chain radar chart")}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg transition text-left"
          >
            + Radar Chart
          </button>
          <button
            onClick={() => handleSendPrompt("Switch theme to Cyberpunk")}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg transition text-left"
          >
            🎨 Cyberpunk Theme
          </button>
        </div>
      </div>

      {/* Prompt Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Copilot to modify dashboard..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isProcessing}
            className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white hover:opacity-90 disabled:opacity-40 transition shadow-md shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
