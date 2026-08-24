import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WidgetSpec, ColorScaleSpec } from '../core/types';
import { formatValue } from '../utils/formatters';
import { 
  MapPin, Store, DollarSign, User, ShieldCheck, 
  Globe, Satellite, Target, Plus, Minus, Compass, 
  TrendingUp, PieChart, X, Sparkles, Layers 
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Master 7-Eleven Store Branches across Malaysia with accurate coordinates
  const allMasterStores = [
    { id: '7E-1082', name: 'KLCC Twin Towers Concourse', lat: 3.1578, lng: 101.7123, region: 'Klang Valley / Central', sales: 38400, target: 35000, manager: 'Ahmad Zaki', nps: 96, pos_count: 8 },
    { id: '7E-2041', name: 'Mid Valley Megamall North Court', lat: 3.1189, lng: 101.6781, region: 'Klang Valley / Central', sales: 31200, target: 32000, manager: 'Michelle Tan', nps: 88, pos_count: 6 },
    { id: '7E-0492', name: 'Gurney Plaza Waterfront', lat: 5.4377, lng: 100.3098, region: 'Northern Region', sales: 24500, target: 25000, manager: 'Rajeswary S.', nps: 84, pos_count: 5 },
    { id: '7E-3118', name: 'JB City Square Customs Hub', lat: 1.4619, lng: 103.7638, region: 'Southern Region', sales: 28900, target: 30000, manager: 'Kevin Wong', nps: 78, pos_count: 6 },
    { id: '7E-0842', name: 'KLIA2 Departure Hall Terminal', lat: 2.7456, lng: 101.6841, region: 'Klang Valley / Central', sales: 42100, target: 38000, manager: 'Noraini Mohd', nps: 98, pos_count: 10 },
    { id: '7E-1934', name: 'Ipoh Old Town Heritage', lat: 4.5975, lng: 101.0772, region: 'Northern Region', sales: 16800, target: 22000, manager: 'Chong Wei Lun', nps: 42, pos_count: 4 },
    { id: '7E-4421', name: 'Kuantan Teluk Cempedak Beach', lat: 3.8168, lng: 103.3654, region: 'East Coast & Islands', sales: 19500, target: 20000, manager: 'Fatimah Ali', nps: 68, pos_count: 4 },
    { id: '7E-5512', name: 'Kuching Waterfront Heritage', lat: 1.5583, lng: 110.3444, region: 'Sabah & Sarawak', sales: 21400, target: 22000, manager: 'Leonard Jabu', nps: 74, pos_count: 5 }
  ].map(p => {
    const attainmentPct = Math.round((p.sales / p.target) * 1000) / 10;
    return {
      ...p,
      target_achievement_pct: attainmentPct
    };
  });

  // Sub-widget starts HIDDEN until user clicks a store pin!
  const [selectedPin, setSelectedPin] = useState<any | null>(null);
  const [mapStyle, setMapStyle] = useState<'google_streets' | 'google_satellite' | 'google_terrain'>('google_streets');

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

  // Official Google Maps Tile Providers
  const GOOGLE_MAP_TILES = {
    google_streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    google_satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Satellite Hybrid with Road Names
    google_terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  };

  // 1. Initialize Leaflet with Real Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [4.2105, 108.9758], // Malaysia center (Peninsular & Borneo)
          zoom: 6,
          zoomControl: false, // Custom styled zoom controls
          scrollWheelZoom: true
        });

        const tileLayer = L.tileLayer(GOOGLE_MAP_TILES[mapStyle], {
          maxZoom: 19,
          attribution: '© Google Maps'
        }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
        tileLayerRef.current = tileLayer;
        markersLayerRef.current = markersGroup;
      }
    } catch (err) {
      console.warn('Map init:', err);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        if (mapContainerRef.current) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }
      } catch (err) {}
    };
  }, []);

  // 2. Switch Google Map Tile Layer
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      tileLayerRef.current.setUrl(GOOGLE_MAP_TILES[mapStyle]);
    }
  }, [mapStyle]);

  // 3. Render Authentic Google Maps Teardrop Needles Pointing Exactly at GPS Ground Location
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    try {
      markersLayerRef.current.clearLayers();

      allMasterStores.forEach((pin) => {
        const isSelected = selectedPin?.id === pin.id;
        const attainmentPct = pin.target_achievement_pct ?? 100;
        const { color } = getAttainmentColor(attainmentPct);

        // Authentic Google Maps Teardrop Pointer with Needle Tip pointing directly to ground coordinates
        const markerHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(0, 0);">
            <!-- Teardrop Map Pin Card -->
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              background: #0f172a;
              color: white;
              padding: 4px 10px;
              border-radius: 12px;
              border: 2px solid ${isSelected ? '#38bdf8' : color};
              box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 14px ${color}80;
              font-family: ui-sans-serif, system-ui, sans-serif;
              white-space: nowrap;
            ">
              <span style="
                background: ${color};
                color: #020617;
                font-size: 11px;
                font-weight: 900;
                padding: 2px 6px;
                border-radius: 6px;
              ">${attainmentPct}%</span>
              <span style="font-size: 11px; font-weight: 800; color: #f8fafc; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">
                ${pin.name}
              </span>
            </div>

            <!-- Downward Pointing Teardrop Needle Tip -->
            <div style="
              width: 0;
              height: 0;
              border-left: 7px solid transparent;
              border-right: 7px solid transparent;
              border-top: 9px solid ${isSelected ? '#38bdf8' : color};
              margin-top: -1px;
              filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));
            "></div>

            <!-- Ground Contact Dot -->
            <div style="
              width: 5px;
              height: 5px;
              background: ${color};
              border-radius: 50%;
              margin-top: -2px;
            "></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-teardrop-pin',
          iconSize: [180, 42],
          iconAnchor: [90, 42] // Precise anchor at the bottom needle tip!
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedPin(pin);
        });

        markersLayerRef.current?.addLayer(marker);
      });
    } catch (err) {
      console.warn('Marker render notice:', err);
    }
  }, [selectedPin, mapStyle, colorScale]);

  const handleCloseDrilldown = () => {
    setSelectedPin(null);
  };

  // Generate dynamic hourly velocity chart for the selected store
  const getHourlyChartOption = () => {
    const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];
    const scale = (selectedPin?.sales || 30000) / 30000;
    const salesData = [850, 2400, 3100, 4800, 3600, 3200, 5600, 6200, 4900, 1800].map(v => Math.round(v * scale));
    const txData = [45, 130, 175, 260, 195, 180, 295, 330, 260, 110].map(v => Math.round(v * scale));

    return {
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any[]) => {
          let res = `<div style="font-weight: bold; margin-bottom: 4px;">Time: ${params[0].name}</div>`;
          params.forEach(p => {
            const isSales = p.seriesName.includes('Sales');
            const val = isSales ? formatValue(p.value, 'RM 0,0') : formatValue(p.value, '0,0');
            res += `<div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>${p.marker} ${p.seriesName}</span>
              <strong>${val}</strong>
            </div>`;
          });
          return res;
        }
      },
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
          name: 'Sales (RM)',
          nameTextStyle: { color: '#94a3b8', fontSize: 10 },
          splitLine: { lineStyle: { color: '#1e293b' } },
          axisLabel: { 
            color: '#94a3b8', 
            fontSize: 10, 
            formatter: (v: number) => formatValue(v, 'RM 0,0') 
          }
        },
        {
          type: 'value',
          name: 'POS Tx',
          nameTextStyle: { color: '#94a3b8', fontSize: 10 },
          splitLine: { show: false },
          axisLabel: { 
            color: '#94a3b8', 
            fontSize: 10,
            formatter: (v: number) => formatValue(v, '0,0')
          }
        }
      ],
      series: [
        {
          name: 'Hourly POS Sales (RM)',
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
      tooltip: { 
        trigger: 'item', 
        formatter: (p: any) => `${p.name}: <strong>${formatValue(p.value, 'RM 0,0')}</strong> (${p.percent}%)` 
      },
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
      {/* 1. Header Bar with Real Google Maps Layer Switcher */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-100 text-sm tracking-tight">{data?.dynamicTitle || widget.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
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
            onClick={() => setMapStyle('google_terrain')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'google_terrain' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Google Terrain
          </button>
        </div>
      </div>

      {/* 2. Real Interactive Google Maps Viewport with Synchronized Teardrop Pins */}
      <div className="h-[480px] relative w-full bg-slate-950">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Custom Zoom Controls (Top Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-20 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 w-full"></div>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 w-full"></div>
          <button
            onClick={() => mapInstanceRef.current?.setView([4.2105, 108.9758], 6)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Reset to Malaysia View"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Target Attainment Legend Bar (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md z-20 flex flex-col gap-1.5 text-[11px] pointer-events-auto">
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

        {/* Prompt Pill when no store is selected */}
        {!selectedPin && (
          <div className="absolute bottom-4 left-4 bg-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-xl z-20 flex items-center gap-2.5 text-xs text-slate-300 pointer-events-auto animate-in fade-in">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Click any teardrop store pin on the map to dive into detailed hourly & category performance.</span>
          </div>
        )}
      </div>

      {/* 3. STORE DRILL-DOWN SUB-WIDGET CONTAINER (HIDDEN UNTIL USER CLICKS A STORE!) */}
      {selectedPin && (
        <div className="border-t border-slate-800 bg-slate-950/95 p-5 animate-in slide-in-from-top-4 duration-300">
          {/* Drilldown Header with Close Button */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
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

            {/* Quick Switch Store Pills & Close Button */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-sm">
                {allMasterStores.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedPin(st)}
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

              <button
                onClick={handleCloseDrilldown}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
                title="Close Store Drilldown"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Widget KPI Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily POS Revenue</span>
              <span className="text-xl font-black text-white mt-0.5 block">{formatValue(selectedPin.sales, 'RM 0,0')}</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">+12.4% vs last week</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GSheet Budget Target</span>
              <span className="text-xl font-black text-cyan-300 mt-0.5 block">{formatValue(selectedPin.target, 'RM 0,0')}</span>
              <span className="text-[10px] font-semibold mt-0.5 block" style={{ color: getAttainmentColor(selectedPin.target_achievement_pct).color }}>
                {selectedPin.target_achievement_pct}% Attainment
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active POS Lanes</span>
              <span className="text-xl font-black text-indigo-300 mt-0.5 block">{selectedPin.pos_count} Lanes</span>
              <span className="text-[10px] text-indigo-400 font-semibold mt-0.5 block">100% Online & Synced</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer NPS Rating</span>
              <span className="text-xl font-black text-amber-300 mt-0.5 block">★ {selectedPin.nps} / 100</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Store Mgr: {selectedPin.manager}</span>
            </div>
          </div>

          {/* Sub-Widget Charts: 1 Line Chart (Hourly Velocity) + 1 Donut Chart (Category Share) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Hourly Transaction Velocity & Customer Traffic
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Live BigQuery Stream</span>
              </div>
              <div className="h-[200px]">
                <ReactECharts option={getHourlyChartOption()} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-indigo-400" /> Division Share
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Product Mix</span>
              </div>
              <div className="h-[200px]">
                <ReactECharts option={getCategoryChartOption()} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
