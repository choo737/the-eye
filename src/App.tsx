import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { YamlEditor } from './components/YamlEditor';
import { DashboardCanvas } from './components/DashboardCanvas';
import { CopilotDrawer } from './components/CopilotDrawer';
import { DataSourceModal } from './components/DataSourceModal';
import { ExportModal } from './components/ExportModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { DashboardHub } from './components/DashboardHub';
import { INITIAL_DASHBOARDS, DashboardMetadata } from './core/dashboardRegistry';
import { parseDashboardYaml, stringifyDashboardSpec } from './core/parser';
import { DashboardTheme } from './core/types';
import { UserRole } from './core/authTypes';

export function App() {
  const [dashboards, setDashboards] = useState<DashboardMetadata[]>(INITIAL_DASHBOARDS);
  const [activeDashboard, setActiveDashboard] = useState<DashboardMetadata>(INITIAL_DASHBOARDS[0]);
  const [isHubView, setIsHubView] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'viewer' | 'editor'>('viewer');
  const [managementMode, setManagementMode] = useState<'git_cicd' | 'ui_editor'>('git_cicd');
  
  // User Session & RBAC
  const [currentUserEmail] = useState<string>('admin@jackychoo.altostrat.com');
  const [currentUserName] = useState<string>('Jacky Choo');
  const [globalRole, setGlobalRole] = useState<UserRole>('owner');

  const [yamlCode, setYamlCode] = useState<string>(activeDashboard.yaml);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [showCopilot, setShowCopilot] = useState<boolean>(false);
  const [showDataSources, setShowDataSources] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [theme, setTheme] = useState<DashboardTheme>('emerald-slate');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Parse YAML in real-time
  const parseResult = useMemo(() => {
    return parseDashboardYaml(yamlCode);
  }, [yamlCode]);

  // Compute effective role on active dashboard
  const effectiveRole = useMemo(() => {
    if (globalRole === 'owner') return 'owner';
    return activeDashboard.permissions[currentUserEmail] || globalRole;
  }, [globalRole, activeDashboard, currentUserEmail]);

  const canEdit = effectiveRole === 'owner' || effectiveRole === 'editor';

  // Open dashboard from Hub
  const handleOpenDashboardFromHub = (dashboard: DashboardMetadata, mode: 'viewer' | 'editor') => {
    setActiveDashboard(dashboard);
    setYamlCode(dashboard.yaml);
    setViewMode(mode);
    setIsHubView(false);
    setActiveFilters({});
  };

  // Create new dashboard
  const handleCreateDashboard = (newDash: DashboardMetadata) => {
    setDashboards(prev => [newDash, ...prev]);
    setActiveDashboard(newDash);
    setYamlCode(newDash.yaml);
    setViewMode('editor');
    setIsHubView(false);
    setActiveFilters({});
  };

  // Update permissions
  const handleUpdatePermissions = (dashboardId: string, permissions: Record<string, 'owner' | 'editor' | 'viewer'>) => {
    setDashboards(prev => prev.map(d => d.id === dashboardId ? { ...d, permissions } : d));
    if (activeDashboard.id === dashboardId) {
      setActiveDashboard(prev => ({ ...prev, permissions }));
    }
  };

  // Delete dashboard
  const handleDeleteDashboard = (dashboardId: string) => {
    setDashboards(prev => prev.filter(d => d.id !== dashboardId));
    if (activeDashboard.id === dashboardId && dashboards.length > 1) {
      const remaining = dashboards.filter(d => d.id !== dashboardId)[0];
      setActiveDashboard(remaining);
      setYamlCode(remaining.yaml);
    }
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const handleResetFilters = () => {
    setActiveFilters({});
  };

  const handleReset = () => {
    setYamlCode(activeDashboard.yaml);
    setActiveFilters({});
  };

  const handleApplySpecYaml = (newYaml: string) => {
    setYamlCode(newYaml);
    setDashboards(prev => prev.map(d => d.id === activeDashboard.id ? { ...d, yaml: newYaml, updatedAt: 'Just now' } : d));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        spec={parseResult.spec}
        currentDashboardKey={activeDashboard.id}
        onSelectDashboard={(id) => {
          const found = dashboards.find(d => d.id === id);
          if (found) {
            setActiveDashboard(found);
            setYamlCode(found.yaml);
            setActiveFilters({});
            setIsHubView(false);
          }
        }}
        isHubView={isHubView}
        onToggleHubView={() => setIsHubView(!isHubView)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        managementMode={managementMode}
        onChangeManagementMode={setManagementMode}
        showEditor={showEditor}
        onToggleEditor={() => setShowEditor(!showEditor)}
        showCopilot={showCopilot}
        onToggleCopilot={() => setShowCopilot(!showCopilot)}
        onOpenDataSources={() => setShowDataSources(true)}
        onOpenExport={() => setShowExport(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        userRole={effectiveRole}
        onChangeUserRole={setGlobalRole}
        validation={parseResult.validation}
        theme={theme}
        onChangeTheme={setTheme}
        viewport={viewport}
        onChangeViewport={setViewport}
        onReset={handleReset}
      />

      {/* Main Workspace Area */}
      {isHubView ? (
        <DashboardHub
          dashboards={dashboards}
          currentUserEmail={currentUserEmail}
          currentUserName={currentUserName}
          currentUserRole={globalRole}
          onOpenDashboard={handleOpenDashboardFromHub}
          onCreateDashboard={handleCreateDashboard}
          onUpdatePermissions={handleUpdatePermissions}
          onDeleteDashboard={handleDeleteDashboard}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Monaco YAML Editor (Only in Editor Mode for Authorized Roles) */}
          {viewMode === 'editor' && canEdit && showEditor && (
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

          {/* Dashboard Canvas with Git CI/CD Governance Banner */}
          {parseResult.spec ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {managementMode === 'git_cicd' && viewMode === 'editor' && (
                <div className="bg-indigo-950/80 border-b border-indigo-800/80 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-indigo-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase text-[10px]">
                      Git CI/CD Governance
                    </span>
                    <span>
                      On-screen dashboard edits are locked to prevent divergence from repository history. Updates are managed via pull request.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://github.com/choo737/the-eye"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-800 text-white rounded-md text-[11px] font-semibold border border-indigo-700/60 transition shadow-sm"
                    >
                      Open Repository (choo737/the-eye)
                    </a>
                    <button
                      onClick={() => setManagementMode('ui_editor')}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md text-[11px] font-medium border border-slate-700 transition"
                    >
                      Unlock for UI Editing
                    </button>
                  </div>
                </div>
              )}
              <DashboardCanvas
              spec={parseResult.spec}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              viewport={viewport}
            />
          </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-950">
              <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-rose-400 mb-2">YAML Parsing Error</h3>
                <p className="text-xs text-slate-400 font-mono">{parseResult.parseError}</p>
              </div>
            </div>
          )}

          {/* AI Copilot Drawer (Only in Editor Mode) */}
          {viewMode === 'editor' && canEdit && showCopilot && (
            <CopilotDrawer
              spec={parseResult.spec}
              onApplySpecYaml={handleApplySpecYaml}
              onClose={() => setShowCopilot(false)}
              isGitLocked={managementMode === 'git_cicd'}
            />
          )}
        </div>
      )}

      {/* Modals */}
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

      {showAdmin && (
        <AdminPanelModal
          onClose={() => setShowAdmin(false)}
          currentUserRole={globalRole}
        />
      )}
    </div>
  );
}

export default App;
