import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { YamlEditor } from './components/YamlEditor';
import { DashboardCanvas } from './components/DashboardCanvas';
import { CopilotDrawer } from './components/CopilotDrawer';
import { DataSourceModal } from './components/DataSourceModal';
import { ExportModal } from './components/ExportModal';
import { SAMPLE_DASHBOARDS } from './core/sampleDashboards';
import { parseDashboardYaml, stringifyDashboardSpec } from './core/parser';
import { DashboardTheme } from './core/types';

export function App() {
  const [currentDashboardKey, setCurrentDashboardKey] = useState<string>('seven-eleven-bq');
  const [yamlCode, setYamlCode] = useState<string>(SAMPLE_DASHBOARDS['seven-eleven-bq'].yaml);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [showCopilot, setShowCopilot] = useState<boolean>(false);
  const [showDataSources, setShowDataSources] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [theme, setTheme] = useState<DashboardTheme>('emerald-slate');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const parseResult = useMemo(() => {
    return parseDashboardYaml(yamlCode);
  }, [yamlCode]);

  const handleSelectDashboard = (key: string) => {
    const found = SAMPLE_DASHBOARDS[key];
    if (found) {
      setCurrentDashboardKey(key);
      setYamlCode(found.yaml);
      setActiveFilters({});
    }
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const handleResetFilters = () => {
    setActiveFilters({});
  };

  const handleReset = () => {
    handleSelectDashboard(currentDashboardKey);
  };

  const handleApplySpecYaml = (newYaml: string) => {
    setYamlCode(newYaml);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header
        spec={parseResult.spec}
        currentDashboardKey={currentDashboardKey}
        onSelectDashboard={handleSelectDashboard}
        showEditor={showEditor}
        onToggleEditor={() => setShowEditor(!showEditor)}
        showCopilot={showCopilot}
        onToggleCopilot={() => setShowCopilot(!showCopilot)}
        onOpenDataSources={() => setShowDataSources(true)}
        onOpenExport={() => setShowExport(true)}
        validation={parseResult.validation}
        theme={theme}
        onChangeTheme={setTheme}
        viewport={viewport}
        onChangeViewport={setViewport}
        onReset={handleReset}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {showEditor && (
          <YamlEditor
            yamlCode={yamlCode}
            onChange={setYamlCode}
            validation={parseResult.validation}
            onFormat={() => {
              if (parseResult.spec) {
                setYamlCode(stringifyDashboardSpec(parseResult.spec));
              }
            }}
          />
        )}

        {parseResult.spec ? (
          <DashboardCanvas
            spec={parseResult.spec}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            viewport={viewport}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-950">
            <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-rose-400 mb-2">YAML Parsing Error</h3>
              <p className="text-xs text-slate-400 font-mono">{parseResult.parseError}</p>
            </div>
          </div>
        )}

        {showCopilot && (
          <CopilotDrawer
            spec={parseResult.spec}
            onApplySpecYaml={handleApplySpecYaml}
            onClose={() => setShowCopilot(false)}
          />
        )}
      </div>

      {showDataSources && (
        <DataSourceModal
          sources={parseResult.spec?.data_sources || []}
          onClose={() => setShowDataSources(false)}
        />
      )}

      {showExport && parseResult.spec && (
        <ExportModal
          spec={parseResult.spec}
          activeFilters={activeFilters}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

export default App;
