import React, { useEffect, useRef } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { Copy, Check, FileCode, AlertCircle, AlertTriangle, Sparkles, Wrench } from 'lucide-react';
import { ValidationResult, LintDiagnostic } from '../core/types';

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
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Synchronize Monaco Editor In-Line Error Squiggles
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const monaco = monacoRef.current;
      const model = editorRef.current.getModel();

      if (model) {
        const markers = validation.errors.map(err => ({
          severity: err.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
          message: err.message,
          startLineNumber: err.line || 1,
          startColumn: err.column || 1,
          endLineNumber: err.line || 1,
          endColumn: 100
        }));

        monaco.editor.setModelMarkers(model, 'yaml-linter', markers);
      }
    }
  }, [validation]);

  const handleQuickFix = (err: LintDiagnostic) => {
    if (!err.fixAction) return;
    const target = err.fixAction.targetString;
    const repl = err.fixAction.replacement;
    if (target && yamlCode.includes(target)) {
      const updatedYaml = yamlCode.replace(target, repl);
      onChange(updatedYaml);
    }
  };

  const errorCount = validation.errors.filter(e => e.severity === 'error').length;
  const warningCount = validation.errors.filter(e => e.severity === 'warning').length;

  return (
    <div className="w-[450px] lg:w-[560px] border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 h-full">
      {/* Editor Header Bar */}
      <div className="h-11 px-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span>dashboard.yaml</span>
          <span className="text-[10px] text-slate-500 font-mono">YAML Spec</span>
        </div>

        <div className="flex items-center gap-2">
          {validation.valid && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Valid Schema
            </span>
          )}
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
          onMount={handleEditorDidMount}
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

      {/* Real-time Diagnostics / Linter Panel */}
      {validation.errors.length > 0 && (
        <div className={`border-t p-3.5 max-h-48 overflow-y-auto text-xs ${
          errorCount > 0 ? 'border-rose-500/30 bg-rose-950/40' : 'border-amber-500/30 bg-amber-950/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-bold">
              {errorCount > 0 ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className={errorCount > 0 ? 'text-rose-300' : 'text-amber-300'}>
                Linter Diagnostics ({errorCount} Errors, {warningCount} Warnings)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">AST Schema Validator</span>
          </div>

          <div className="space-y-2">
            {validation.errors.map((err, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl border flex items-start justify-between gap-2.5 font-mono text-[11px] ${
                  err.severity === 'error' 
                    ? 'bg-rose-900/30 border-rose-500/30 text-rose-200' 
                    : 'bg-amber-900/30 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {err.line && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold shrink-0">
                      L{err.line}
                    </span>
                  )}
                  <div>
                    <span className="font-bold text-white">{err.path}: </span>
                    <span>{err.message}</span>
                  </div>
                </div>

                {err.fixAction && (
                  <button
                    onClick={() => handleQuickFix(err)}
                    className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 transition shrink-0"
                    title="Apply Quick Fix"
                  >
                    <Wrench className="w-3 h-3" /> Quick Fix
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
