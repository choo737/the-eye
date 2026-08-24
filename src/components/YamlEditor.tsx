import React from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, FileCode, AlertCircle, RefreshCw } from 'lucide-react';
import { ValidationResult } from '../core/types';

interface YamlEditorProps {
  yamlCode: string;
  onChange: (value: string) => void;
  validation: ValidationResult;
  onFormat: () => void;
}

export const YamlEditor: React.FC<YamlEditorProps> = ({
  yamlCode,
  onChange,
  validation,
  onFormat
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-[450px] lg:w-[540px] border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 h-full">
      {/* Editor Header Bar */}
      <div className="h-11 px-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span>dashboard.yaml</span>
          <span className="text-[10px] text-slate-500 font-mono">YAML Spec</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Copy YAML"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          language="yaml"
          theme="vs-dark"
          value={yamlCode}
          onChange={(value) => onChange(value || '')}
          options={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>

      {/* Validation Panel */}
      {!validation.valid && (
        <div className="border-t border-rose-500/30 bg-rose-950/40 p-3 max-h-36 overflow-y-auto text-xs">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Schema Validation Errors ({validation.errors.length})</span>
          </div>
          <ul className="space-y-1 text-rose-300/90 font-mono text-[11px]">
            {validation.errors.map((err, idx) => (
              <li key={idx} className="flex gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span><strong className="text-rose-200">{err.path}:</strong> {err.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
