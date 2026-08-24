import React from 'react';
import { DashboardSpec, WidgetSpec } from '../core/types';
import { FilterBar } from './FilterBar';
import { KpiWidget } from './KpiWidget';
import { ChartWidget } from './ChartWidget';
import { TableWidget } from './TableWidget';
import { executeWidgetQuery } from '../engine/queryEngine';

interface DashboardCanvasProps {
  spec: DashboardSpec;
  activeFilters: Record<string, any>;
  onFilterChange: (id: string, value: any) => void;
  onResetFilters: () => void;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  spec,
  activeFilters,
  onFilterChange,
  onResetFilters,
  viewport
}) => {
  const getColSpanClass = (w: number) => {
    if (viewport === 'mobile') return 'col-span-12';
    if (viewport === 'tablet') {
      if (w <= 4) return 'col-span-6';
      return 'col-span-12';
    }
    // Desktop 12-column grid
    switch (w) {
      case 1: return 'col-span-1';
      case 2: return 'col-span-2';
      case 3: return 'col-span-3';
      case 4: return 'col-span-4';
      case 5: return 'col-span-5';
      case 6: return 'col-span-6';
      case 7: return 'col-span-7';
      case 8: return 'col-span-8';
      case 9: return 'col-span-9';
      case 10: return 'col-span-10';
      case 11: return 'col-span-11';
      case 12: default: return 'col-span-12';
    }
  };

  const handleChartClick = (widget: WidgetSpec, eventParams: any) => {
    if (widget.interaction?.on_click_filter) {
      const { filter_id } = widget.interaction.on_click_filter;
      const clickedVal = eventParams.name || eventParams.seriesName;
      if (clickedVal) {
        const targetFilter = spec.filters?.find(f => f.id === filter_id);
        const isMulti = targetFilter?.type === 'multi_select';
        onFilterChange(filter_id, isMulti ? [clickedVal] : clickedVal);
      }
    }
  };

  const viewportContainerClass = 
    viewport === 'mobile' ? 'max-w-md mx-auto ring-1 ring-slate-800 rounded-3xl p-4 my-4 bg-slate-950 shadow-2xl' :
    viewport === 'tablet' ? 'max-w-3xl mx-auto ring-1 ring-slate-800 rounded-3xl p-6 my-4 bg-slate-950 shadow-2xl' :
    'w-full p-6 sm:p-8';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950">
      <div className={viewportContainerClass}>
        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {spec.title}
          </h1>
          {spec.description && (
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              {spec.description}
            </p>
          )}
        </div>

        {/* Dynamic Filters Bar */}
        {spec.filters && spec.filters.length > 0 && (
          <div className="mb-6">
            <FilterBar
              filters={spec.filters}
              activeFilters={activeFilters}
              onFilterChange={onFilterChange}
              onResetFilters={onResetFilters}
            />
          </div>
        )}

        {/* 12-Column Responsive Grid Canvas */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          {spec.widgets.map((widget) => {
            const data = executeWidgetQuery(widget, activeFilters);
            const colSpan = getColSpanClass(widget.position?.w || 12);

            return (
              <div key={widget.id} className={`${colSpan}`}>
                {widget.type === 'kpi_card' ? (
                  <KpiWidget widget={widget} data={data} />
                ) : widget.type === 'table' ? (
                  <TableWidget widget={widget} data={data} />
                ) : (
                  <ChartWidget
                    widget={widget}
                    data={data}
                    onChartClick={(params) => handleChartClick(widget, params)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
