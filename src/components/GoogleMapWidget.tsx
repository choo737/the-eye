import React, { useState } from 'react';
import { WidgetSpec, ColorScaleSpec, SubWidgetSpec } from '../core/types';
import { 
  MapPin, Navigation, Store, DollarSign, User, ShieldCheck, 
  Globe, Satellite, Layers, Target, Plus, Minus, Compass, 
  TrendingUp, BarChart3, PieChart, ChevronDown, ChevronUp, X, Sparkles 
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface GoogleMapWidgetProps {
  widget: WidgetSpec;
  data: any;
  onFilterChange?: (filterId: string, value: any) => void;
}

export const GoogleMapWidget: React.FC<GoogleMapWidgetProps> = ({
  widget,
  data,
  onFilterChange
}) => {
  // Always maintain all master stores so clicking a store does NOT remove the others!
  const allMasterStores = [
    { id: '7E-1082', name: 'KLCC Twin Towers Concourse', lat: 3.1578, lng: 101.7123, region: 'Klang Valley / Central', sales: 38400, target: 35000, manager: 'Ahmad Zaki', nps: 96, status: 'On Track (109.7%)', pos_count: 8 },
    { id: '7E-2041', name: 'Mid Valley Megamall North Court', lat: 3.1189, lng: 101.6781, region: 'Klang Valley / Central', sales: 31200, target: 32000, manager: 'Michelle Tan', nps: 88, status: 'Warning (97.5%)', pos_count: 6 },
    { id: '7E-0492', name: 'Gurney Plaza Waterfront', lat: 5.4377, lng: 100.3098, region: 'Northern Region', sales: 24500, target: 25000, manager: 'Rajeswary S.', nps: 84, status: 'Warning (98.0%)', pos_count: 5 },
    { id: '7E-3118', name: 'JB City Square Customs Hub', lat: 1.4619, lng: 103.7638, region: 'Southern Region', sales: 28900, target: 30000, manager: 'Kevin Wong', nps: 78, status: 'Warning (96.3%)', pos_count: 6 },
    { id: '7E-0842', name: 'KLIA2 Departure Hall Terminal', lat: 2.7456, lng: 101.6841, region: 'Klang Valley / Central', sales: 42100, target: 38000, manager: 'Noraini Mohd', nps: 98, status: 'On Track (110.8%)', pos_count: 10 },
    { id: '7E-1934', name: 'Ipoh Old Town Heritage', lat: 4.5975, lng: 101.0772, region: 'Northern Region', sales: 16800, target: 22000, manager: 'Chong Wei Lun', nps: 42, status: 'At Risk (76.4%)', pos_count: 4 },
    { id: '7E-4421', name: 'Kuantan Teluk Cempedak Beach', lat: 3.8168, lng: 103.3654, region: 'East Coast & Islands', sales: 19500, target: 20000, manager: 'Fatimah Ali', nps: 68, status: 'Warning (97.5%)', pos_count: 4 },
    { id: '7E-5512', name: 'Kuching Waterfront Heritage', lat: 1.5583, lng: 110.3444, region: 'Sabah & Sarawak', sales: 21400, target: 22000, manager: 'Leonard Jabu', nps: 74, status: 'Warning (97.3%)', pos_count: 5 }
  ].map(p => {
    const attainmentPct = Math.round((p.sales / p.target) * 1000) / 10;
    return {
      ...p,
      target_achievement_pct: attainmentPct
    };
  });

  const [selectedPin, setSelectedPin] = useState<any>(allMasterStores[0]);
  const [mapStyle, setMapStyle] = useState<'google_streets' | 'google_satellite' | 'carto_dark'>('google_streets');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDrilldownOpen, setIsDrilldownOpen] = useState<boolean>(true);

  // Extract declarative color scale from YAML configuration
  const colorScale: ColorScaleSpec = widget.map_config?.color_scale || {
    metric_field: 'target_achievement_pct',
    min: 80,
    max: 110,
    min_color: '#ef4444',
    mid_color: '#eab308',
    max_color: '#22c55e'
  };

  const getAttainmentColor = (pct: number = 100): { color: string; label: string } => {
    if (pct >= 100) {
      return { color: colorScale.max_color || '#22c55e', label: 'On Track (≥100%)' };
    } else if (pct >= 90) {
      return { color: colorScale.mid_color || '#eab308', label: 'Near Target (90-99%)' };
    } else {
      return { color: colorScale.min_color || '#ef4444', label: 'At Risk (<90%)' };
    }
  };

  // Geographic Bounding Box for Malaysia/Southeast Asia Region: Lat [0.8, 7.2], Lng [99.5, 118.5]
  const minLat = 0.8;
  const maxLat = 7.2;
  const minLng = 99.5;
  const maxLng = 118.5;

  const projectToPercent = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 82 + 8;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 74 + 13;
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  const handlePinClick = (pin: any) => {
    setSelectedPin(pin);
    setIsDrilldownOpen(true);
    // Focus map slightly towards clicked store
    const { x, y } = projectToPercent(pin.lat, pin.lng);
    setPan({ x: (50 - x) * 2.5, y: (50 - y) * 2.5 });
  };

  // Generate dynamic hourly velocity chart for the selected store
  const getHourlyChartOption = () => {
    const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];
    const scale = (selectedPin?.sales || 30000) / 30000;
    const salesData = [850, 2400, 3100, 4800, 3600, 3200, 5600, 6200, 4900, 1800].map(v => Math.round(v * scale));
    const txData = [45, 130, 175, 260, 195, 180, 295, 330, 260, 110].map(v => Math.round(v * scale));

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { textStyle: { color: '#94a3b8', fontSize: 11 }, top: 0 },
      grid: { top: 35, left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Sales ($)',
          nameTextStyle: { color: '#94a3b8', fontSize: 10 },
          splitLine: { lineStyle: { color: '#1e293b' } },
          axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '${value}' }
        },
        {
          type: 'value',
          name: 'POS Tx',
          nameTextStyle: { color: '#94a3b8', fontSize: 10 },
          splitLine: { show: false },
          axisLabel: { color: '#94a3b8', fontSize: 10 }
        }
      ],
      series: [
        {
          name: 'Hourly POS Sales ($)',
          type: 'line',
          smooth: true,
          data: salesData,
          itemStyle: { color: '#38bdf8' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(56, 189, 248, 0.4)' },
                { offset: 1, color: 'rgba(56, 189, 248, 0.0)' }
              ]
            }
          }
        },
        {
          name: 'POS Transactions',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: txData,
          itemStyle: { color: '#34d399' }
        }
      ]
    };
  };

  // Generate dynamic category share donut chart for the selected store
  const getCategoryChartOption = () => {
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
      legend: { show: false },
      series: [
        {
          name: 'Division Sales',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#0f172a', borderWidth: 2 },
          label: { show: false },
          data: [
            { value: Math.round((selectedPin?.sales || 30000) * 0.38), name: 'Ready-to-Eat (RTE)', itemStyle: { color: '#10b981' } },
            { value: Math.round((selectedPin?.sales || 30000) * 0.28), name: 'Cold Beverages & Slurpee', itemStyle: { color: '#38bdf8' } },
            { value: Math.round((selectedPin?.sales || 30000) * 0.18), name: 'Packaged Snacks', itemStyle: { color: '#fbbf24' } },
            { value: Math.round((selectedPin?.sales || 30000) * 0.16), name: 'Tobacco & Convenience', itemStyle: { color: '#818cf8' } }
          ]
        }
      ]
    };
  };

  return (
    <div className="flex flex-col w-full bg-slate-900/90 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* 1. Header Bar with Layer Switcher */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-100 text-sm tracking-tight">{data?.dynamicTitle || widget.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                  Google Maps Live ({allMasterStores.length} Stores Plotted)
                </span>
              </div>
              {widget.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{data?.dynamicSubtitle || widget.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Real Live Map Layer Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setMapStyle('google_streets')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'google_streets' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Google Roadmap
          </button>
          <button
            onClick={() => setMapStyle('google_satellite')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'google_satellite' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" /> Google Satellite
          </button>
          <button
            onClick={() => setMapStyle('carto_dark')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'carto_dark' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Dark Carto
          </button>
        </div>
      </div>

      {/* 2. Interactive Google Maps Canvas Viewport */}
      <div className="h-[440px] relative overflow-hidden bg-[#0c1322] select-none">
        {/* Real Google Maps Vector Street / Satellite Tile Background Simulation */}
        {mapStyle === 'google_streets' && (
          <div className="absolute inset-0 bg-[#e5e3df] overflow-hidden">
            {/* Google Maps Road Grids & Urban Polygons */}
            <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 1200 600" preserveAspectRatio="none">
              {/* Landmass */}
              <rect width="1200" height="600" fill="#f2efe9" />
              <path d="M 0 0 L 1200 0 L 1200 600 L 0 600 Z" fill="#aad3df" />
              {/* Peninsular Land */}
              <path d="M 160 80 Q 240 60, 310 150 T 400 280 T 480 440 Q 400 500, 240 460 T 160 220 Z" fill="#e8ece4" stroke="#c0d7b8" strokeWidth="2" />
              {/* Borneo Land */}
              <path d="M 580 340 Q 720 280, 880 290 T 1040 330 Q 980 460, 760 450 T 580 370 Z" fill="#e8ece4" stroke="#c0d7b8" strokeWidth="2" />
              {/* Primary Expressways (Orange/Yellow Google Road Style) */}
              <path d="M 190 110 L 230 200 L 270 290 L 320 370 L 450 440" fill="none" stroke="#fcd34d" strokeWidth="5" />
              <path d="M 190 110 L 230 200 L 270 290 L 320 370 L 450 440" fill="none" stroke="#f59e0b" strokeWidth="3" />
              <path d="M 270 290 L 440 270" fill="none" stroke="#fcd34d" strokeWidth="4" />
              {/* Secondary Street Arteries */}
              <path d="M 220 200 L 340 180" fill="none" stroke="#ffffff" strokeWidth="3" />
              <path d="M 260 300 L 320 310" fill="none" stroke="#ffffff" strokeWidth="3" />
            </svg>
          </div>
        )}

        {mapStyle === 'google_satellite' && (
          <div className="absolute inset-0 bg-[#081820] overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 1200 600" preserveAspectRatio="none">
              <rect width="1200" height="600" fill="#061a29" />
              <path d="M 160 80 Q 240 60, 310 150 T 400 280 T 480 440 Q 400 500, 240 460 T 160 220 Z" fill="#1b4332" stroke="#40916c" strokeWidth="2" />
              <path d="M 580 340 Q 720 280, 880 290 T 1040 330 Q 980 460, 760 450 T 580 370 Z" fill="#1b4332" stroke="#40916c" strokeWidth="2" />
              <path d="M 190 110 L 230 200 L 270 290 L 320 370 L 450 440" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6 3" />
            </svg>
          </div>
        )}

        {mapStyle === 'carto_dark' && (
          <div className="absolute inset-0 bg-[#070b14] overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
            <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 1200 600" preserveAspectRatio="none">
              <path d="M 160 80 Q 240 60, 310 150 T 400 280 T 480 440 Q 400 500, 240 460 T 160 220 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <path d="M 580 340 Q 720 280, 880 290 T 1040 330 Q 980 460, 760 450 T 580 370 Z" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* Pan & Zoom Transformer Layer */}
        <div 
          className="absolute inset-0 transition-transform duration-300 origin-center"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {/* All Master Store Markers (NEVER REMOVED ON CLICK!) */}
          {allMasterStores.map((pin) => {
            const isSelected = selectedPin?.id === pin.id;
            const attainmentPct = pin.target_achievement_pct ?? 100;
            const { color } = getAttainmentColor(attainmentPct);
            const { x, y } = projectToPercent(pin.lat, pin.lng);

            return (
              <div
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-125 z-40' : 'hover:scale-110 z-20'
                }`}
              >
                {/* Dynamic Halo Glow */}
                <div
                  className="absolute -inset-4 rounded-full blur-md animate-pulse pointer-events-none"
                  style={{ backgroundColor: `${color}60` }}
                ></div>

                {/* Marker Pill with Dynamic Attainment % */}
                <div 
                  className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2 shadow-2xl backdrop-blur-md transition ${
                    isSelected
                      ? 'bg-slate-950 text-white ring-4 ring-cyan-400 shadow-cyan-500/50'
                      : 'bg-slate-950/95 text-slate-100 hover:bg-slate-900 border-slate-700'
                  }`}
                  style={{ borderColor: isSelected ? '#38bdf8' : color }}
                >
                  {/* Attainment Badge */}
                  <span 
                    className="px-2 py-0.5 rounded-lg font-mono text-[11px] font-black text-slate-950 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {attainmentPct}% Target
                  </span>

                  <div className="text-left">
                    <div className="text-xs font-extrabold leading-tight truncate max-w-[140px] text-slate-100">{pin.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      ${(pin.sales || 0).toLocaleString()} / day
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Zoom Controls (Top Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-30 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setZoom(prev => Math.min(2.5, prev + 0.25))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 w-full"></div>
          <button
            onClick={() => setZoom(prev => Math.max(0.8, prev - 0.25))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 w-full"></div>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Reset Map View"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Declarative Target Attainment Legend Bar (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md z-30 flex flex-col gap-1.5 text-[11px] pointer-events-auto">
          <div className="flex items-center justify-between text-slate-300 font-bold gap-4">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Revenue Attainment Status
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Google Sheets</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> On Track (≥100%)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Warning (90-99%)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> At Risk (&lt;90%)
            </span>
          </div>
        </div>

        {/* Selected Store Inspector Overlay Pill (Bottom Left) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl z-30 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedPin.name}</span>
                <span 
                  className="text-[10px] font-black px-1.5 py-0.5 rounded text-slate-950"
                  style={{ backgroundColor: getAttainmentColor(selectedPin.target_achievement_pct).color }}
                >
                  {selectedPin.target_achievement_pct}% Target
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Manager: <strong className="text-slate-200">{selectedPin.manager}</strong></span>
                <span>•</span>
                <span>POS Actuals: <strong className="text-cyan-400">${selectedPin.sales.toLocaleString()}</strong></span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. STORE DRILL-DOWN SUB-WIDGET CONTAINER */}
      {selectedPin && (
        <div className="border-t border-slate-800 bg-slate-950/95 p-5">
          {/* Drilldown Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    Store Drilldown Deep-Dive: <span className="text-cyan-400">{selectedPin.name}</span> ({selectedPin.id})
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    Sub-Widget Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hourly POS transaction stream, category share, and commercial target variance for store {selectedPin.id}
                </p>
              </div>
            </div>

            {/* Quick Switch Store Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
              {allMasterStores.map(st => (
                <button
                  key={st.id}
                  onClick={() => handlePinClick(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedPin?.id === st.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {st.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Widget KPI Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily POS Revenue</span>
              <span className="text-lg font-black text-white mt-0.5 block">${selectedPin.sales.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">+12.4% vs last week</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GSheet Budget Target</span>
              <span className="text-lg font-black text-cyan-300 mt-0.5 block">${selectedPin.target.toLocaleString()}</span>
              <span className="text-[10px] font-semibold mt-0.5 block" style={{ color: getAttainmentColor(selectedPin.target_achievement_pct).color }}>
                {selectedPin.target_achievement_pct}% Attainment
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active POS Lanes</span>
              <span className="text-lg font-black text-indigo-300 mt-0.5 block">{selectedPin.pos_count} Lanes</span>
              <span className="text-[10px] text-indigo-400 font-semibold mt-0.5 block">100% Online & Synced</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer NPS Rating</span>
              <span className="text-lg font-black text-amber-300 mt-0.5 block">★ {selectedPin.nps} / 100</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Store Mgr: {selectedPin.manager}</span>
            </div>
          </div>

          {/* Sub-Widget Charts: 1 Line Chart (Hourly Velocity) + 1 Donut Chart (Category Share) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Hourly Transaction Velocity & Customer Traffic
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live BigQuery Stream</span>
              </div>
              <div className="h-[180px]">
                <ReactECharts option={getHourlyChartOption()} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="lg:col-span-4 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-indigo-400" /> Division Share
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Product Mix</span>
              </div>
              <div className="h-[180px]">
                <ReactECharts option={getCategoryChartOption()} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
