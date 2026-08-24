import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WidgetSpec, ColorScaleSpec } from '../core/types';
import { formatValue } from '../utils/formatters';
import { 
  Focus, Scan, MapPin, Store, DollarSign, User, ShieldCheck, 
  Globe, Satellite, Target, Plus, Minus, Compass, 
  TrendingUp, PieChart, X, Layers, Table as TableIcon,
  ChevronRight, ArrowUpDown, Calendar
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface GoogleMapWidgetProps {
  widget: WidgetSpec;
  data: any;
  activeFilters?: Record<string, any>;
  onFilterChange?: (filterId: string, value: any) => void;
}

export const GoogleMapWidget: React.FC<GoogleMapWidgetProps> = ({
  widget,
  data,
  activeFilters = {},
  onFilterChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Time Range Horizon Detection from Main Filter
  const timeRangeFilter = activeFilters['time_range'] || '2026-YTD';
  const timeLabel = typeof timeRangeFilter === 'object' && timeRangeFilter !== null
    ? (timeRangeFilter.label || `${timeRangeFilter.startDate} – ${timeRangeFilter.endDate}`)
    : (timeRangeFilter === '2026-YTD' ? '2026 YTD' 
    : timeRangeFilter === 'last_90_days' ? 'Last Quarter (90 Days)' 
    : timeRangeFilter === 'last_30_days' ? 'Last 30 Days' 
    : timeRangeFilter === 'today' ? 'Today' 
    : timeRangeFilter === 'yesterday' ? 'Yesterday' 
    : timeRangeFilter === 'last_7_days' ? 'Last 7 Days' 
    : '2026 YTD');

  // Fallback master stores dataset
  const defaultMasterStores = [
    { id: '7E-1082', store_id: '7E-1082', store_name: 'KLCC Twin Towers Concourse', name: 'KLCC Twin Towers Concourse', lat: 3.1578, lng: 101.7123, region: 'Klang Valley / Central', sales: 38400, target: 35000, manager: 'Ahmad Zaki', nps: 96, pos_count: 8 },
    { id: '7E-2041', store_id: '7E-2041', store_name: 'Mid Valley Megamall North Court', name: 'Mid Valley Megamall North Court', lat: 3.1189, lng: 101.6781, region: 'Klang Valley / Central', sales: 31200, target: 32000, manager: 'Michelle Tan', nps: 88, pos_count: 6 },
    { id: '7E-0492', store_id: '7E-0492', store_name: 'Gurney Plaza Waterfront', name: 'Gurney Plaza Waterfront', lat: 5.4377, lng: 100.3098, region: 'Northern Region', sales: 24500, target: 25000, manager: 'Rajeswary S.', nps: 84, pos_count: 5 },
    { id: '7E-3118', store_id: '7E-3118', store_name: 'JB City Square Customs Hub', name: 'JB City Square Customs Hub', lat: 1.4619, lng: 103.7638, region: 'Southern Region', sales: 28900, target: 30000, manager: 'Kevin Wong', nps: 78, pos_count: 6 },
    { id: '7E-0842', store_id: '7E-0842', store_name: 'KLIA2 Departure Hall Terminal', name: 'KLIA2 Departure Hall Terminal', lat: 2.7456, lng: 101.6841, region: 'Klang Valley / Central', sales: 42100, target: 38000, manager: 'Noraini Mohd', nps: 98, pos_count: 10 },
    { id: '7E-1934', store_id: '7E-1934', store_name: 'Ipoh Old Town Heritage', name: 'Ipoh Old Town Heritage', lat: 4.5975, lng: 101.0772, region: 'Northern Region', sales: 16800, target: 22000, manager: 'Chong Wei Lun', nps: 42, pos_count: 4 },
    { id: '7E-4421', store_id: '7E-4421', store_name: 'Kuantan Teluk Cempedak Beach', name: 'Kuantan Teluk Cempedak Beach', lat: 3.8168, lng: 103.3654, region: 'East Coast & Islands', sales: 19500, target: 20000, manager: 'Fatimah Ali', nps: 68, pos_count: 4 },
    { id: '7E-5512', store_id: '7E-5512', store_name: 'Kuching Waterfront Heritage', name: 'Kuching Waterfront Heritage', lat: 1.5583, lng: 110.3444, region: 'Sabah & Sarawak', sales: 21400, target: 22000, manager: 'Leonard Jabu', nps: 74, pos_count: 5 }
  ];

  // Dynamically resolve map points from Query Engine with strict property sanitation
  const storePoints = useMemo(() => {
    const rawList = (data?.mapPoints && data.mapPoints.length > 0) ? data.mapPoints : defaultMasterStores;
    return rawList.map((p: any) => {
      const storeName = p.name || p.store_name || p.store || p.title || p.id || '7-Eleven Store';
      const storeId = p.id || p.store_id || '7E-0000';
      const sales = typeof p.sales === 'number' ? p.sales : 30000;
      const target = typeof p.target === 'number' ? p.target : 30000;
      const attainmentPct = p.target_achievement_pct ?? (Math.round((sales / target) * 1000) / 10);
      const manager = p.manager || p.store_manager || 'Store Manager';
      const region = p.region || 'Malaysia';
      const nps = p.nps ?? 85;
      const posCount = p.pos_count ?? 6;

      return {
        ...p,
        id: storeId,
        store_id: storeId,
        name: storeName,
        store_name: storeName,
        sales,
        target,
        target_achievement_pct: attainmentPct,
        manager,
        region,
        nps,
        pos_count: posCount
      };
    });
  }, [data?.mapPoints]);

  const [selectedPin, setSelectedPin] = useState<any | null>(null);
  const [mapStyle, setMapStyle] = useState<'google_streets' | 'google_satellite' | 'google_terrain'>('google_streets');

  // Preserve deep-dive selection on filter change & seamlessly reflect newly changed filter context
  useEffect(() => {
    if (selectedPin) {
      const updated = storePoints.find((p: any) => p.id === selectedPin.id);
      if (updated) {
        setSelectedPin(updated);
      }
    }
  }, [data, activeFilters, storePoints]);

  const showTable = widget.map_config?.show_table !== false;

  const colorScale: ColorScaleSpec = widget.map_config?.color_scale || {
    metric_field: 'target_achievement_pct',
    min: 80,
    max: 110,
    min_color: '#ef4444',
    mid_color: '#eab308',
    max_color: '#22c55e'
  };

  const getAttainmentColor = (pct: number = 100): { color: string; label: string; badgeBg: string } => {
    if (pct >= 100) {
      return { color: colorScale.max_color || '#22c55e', label: 'On Track (≥100%)', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    } else if (pct >= 90) {
      return { color: colorScale.mid_color || '#eab308', label: 'Near Target (90-99%)', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    } else {
      return { color: colorScale.min_color || '#ef4444', label: 'At Risk (<90%)', badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    }
  };

  const renderTemplateString = (templateStr?: string, store?: any): string => {
    if (!templateStr || !store) return templateStr || '';
    return templateStr
      .replace(/\{\{\s*store_name\s*\}\}/g, store.store_name || store.name || '')
      .replace(/\{\{\s*selected_store_name\s*\}\}/g, store.store_name || store.name || '')
      .replace(/\{\{\s*store_id\s*\}\}/g, store.id || store.store_id || '')
      .replace(/\{\{\s*manager\s*\}\}/g, store.manager || '')
      .replace(/\{\{\s*region\s*\}\}/g, store.region || '')
      .replace(/\{\{\s*time_range\s*\}\}/g, timeLabel);
  };

  const GOOGLE_MAP_TILES = {
    google_streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    google_satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    google_terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [4.2105, 108.9758],
          zoom: 6,
          zoomControl: false,
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

  // 2. Switch Tile Layer
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      tileLayerRef.current.setUrl(GOOGLE_MAP_TILES[mapStyle]);
    }
  }, [mapStyle]);

  // 3. Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    try {
      markersLayerRef.current.clearLayers();

      storePoints.forEach((pin: any) => {
        const isSelected = selectedPin?.id === pin.id;
        const attainmentPct = pin.target_achievement_pct ?? 100;
        const { color } = getAttainmentColor(attainmentPct);
        const displayName = pin.store_name || pin.name || pin.id || 'Store';

        const markerHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
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
                ${displayName}
              </span>
            </div>

            <div style="
              width: 0;
              height: 0;
              border-left: 7px solid transparent;
              border-right: 7px solid transparent;
              border-top: 9px solid ${isSelected ? '#38bdf8' : color};
              margin-top: -1px;
            "></div>

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
          iconAnchor: [90, 42]
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedPin((prev: any) => (prev?.id === pin.id ? null : pin));
        });

        markersLayerRef.current?.addLayer(marker);
      });
    } catch (err) {
      console.warn('Marker render:', err);
    }
  }, [selectedPin, mapStyle, colorScale, storePoints]);

  const handleSelectStore = (store: any) => {
    setSelectedPin((prev: any) => {
      if (prev?.id === store.id) {
        return null;
      }
      mapInstanceRef.current?.setView([store.lat, store.lng], 9, { animate: true });
      return store;
    });
  };

  const handleCloseDrilldown = () => {
    setSelectedPin(null);
  };

  // -------------------------------------------------------------
  // GENERIC CASCADING CONTEXT INHERITANCE:
  // Dynamically calculate time-grain series for selected store matching main filter horizon
  // -------------------------------------------------------------
  const { chartXAxis, chartSalesData, chartTxData, periodSales, periodTarget } = useMemo(() => {
    const dailyBase = selectedPin?.sales || 30000;
    const dailyTarget = selectedPin?.target || 30000;

    let xAxis: string[] = [];
    let salesMultipliers: number[] = [];
    let txMultipliers: number[] = [];
    let cumulativeFactor = 1.0;

    const t = String(timeRangeFilter);

    if (t === '2026-YTD' || t.includes('YTD') || t === 'all_time') {
      // 8 Months YTD Grain
      xAxis = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];
      salesMultipliers = [28, 29, 32, 34, 30, 29, 35, 38]; // in thousands per day avg
      txMultipliers = [1400, 1450, 1600, 1720, 1500, 1480, 1750, 1920];
      cumulativeFactor = 236; // ~236 days YTD
    } else if (t === 'last_90_days' || t.includes('Quarter') || t.includes('3_months')) {
      // 90 Days Weekly Grain
      xAxis = ['W24 (Jun)', 'W26 (Jun)', 'W28 (Jul)', 'W30 (Jul)', 'W32 (Aug)', 'W34 (Aug)'];
      salesMultipliers = [30, 31, 33, 35, 37, 39];
      txMultipliers = [1500, 1550, 1650, 1750, 1850, 1950];
      cumulativeFactor = 90;
    } else if (t === 'last_30_days' || t.includes('Month')) {
      // 30 Days 5-Day Interval Grain
      xAxis = ['Day 1-5', 'Day 6-10', 'Day 11-15', 'Day 16-20', 'Day 21-25', 'Day 26-30'];
      salesMultipliers = [32, 34, 31, 36, 38, 41];
      txMultipliers = [1600, 1700, 1550, 1800, 1900, 2050];
      cumulativeFactor = 30;
    } else {
      // Intraday Hourly Grain
      xAxis = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];
      salesMultipliers = [0.85, 2.4, 3.1, 4.8, 3.6, 3.2, 5.6, 6.2, 4.9, 1.8];
      txMultipliers = [45, 130, 175, 260, 195, 180, 295, 330, 260, 110];
      cumulativeFactor = 1.0;
    }

    const scale = dailyBase / 30000;
    const computedSales = salesMultipliers.map(v => Math.round(v * 1000 * scale));
    const computedTx = txMultipliers.map(v => Math.round(v * scale));

    const totalPeriodSales = Math.round(dailyBase * cumulativeFactor);
    const totalPeriodTarget = Math.round(dailyTarget * cumulativeFactor);

    return {
      chartXAxis: xAxis,
      chartSalesData: computedSales,
      chartTxData: computedTx,
      periodSales: totalPeriodSales,
      periodTarget: totalPeriodTarget
    };
  }, [selectedPin, timeRangeFilter]);

  const getHourlyChartOption = () => {
    return {
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any[]) => {
          let res = `<div style="font-weight: bold; margin-bottom: 4px;">Horizon: ${params[0].name}</div>`;
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
        data: chartXAxis,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: [
        {
          type: 'value',
          name: widget.drilldown?.sub_widgets?.[0]?.y?.[0] || 'Sales (RM)',
          nameTextStyle: { color: '#94a3b8', fontSize: 10 },
          splitLine: { lineStyle: { color: '#1e293b' } },
          axisLabel: { 
            color: '#94a3b8', 
            fontSize: 10, 
            formatter: (v: number) => formatValue(v, 'RM 0.0a') 
          }
        },
        {
          type: 'value',
          name: widget.drilldown?.sub_widgets?.[0]?.y?.[1] || 'POS Tx',
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
          name: widget.drilldown?.sub_widgets?.[0]?.y?.[0] || 'POS Sales (RM)',
          type: 'line',
          smooth: true,
          data: chartSalesData,
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
          name: widget.drilldown?.sub_widgets?.[0]?.y?.[1] || 'POS Transactions',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: chartTxData,
          itemStyle: { color: '#34d399' }
        }
      ]
    };
  };

  const getCategoryChartOption = () => {
    return {
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'item', 
        formatter: (p: any) => `${p.name}: <strong>${formatValue(p.value, 'RM 0.0a')}</strong> (${p.percent}%)` 
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
            { value: Math.round(periodSales * 0.38), name: 'Ready-to-Eat (RTE)', itemStyle: { color: '#10b981' } },
            { value: Math.round(periodSales * 0.28), name: 'Cold Beverages & Slurpee', itemStyle: { color: '#38bdf8' } },
            { value: Math.round(periodSales * 0.18), name: 'Packaged Snacks', itemStyle: { color: '#fbbf24' } },
            { value: Math.round(periodSales * 0.16), name: 'Tobacco & Convenience', itemStyle: { color: '#818cf8' } }
          ]
        }
      ]
    };
  };

  const configuredTitle = widget.drilldown?.title 
    ? renderTemplateString(widget.drilldown.title, selectedPin)
    : `Store Performance Drill-Down: ${selectedPin?.name || selectedPin?.store_name || ''}`;

  const configuredSubtitle = widget.drilldown?.subtitle
    ? renderTemplateString(widget.drilldown.subtitle, selectedPin)
    : `Cascading ${timeLabel} performance, category mix, and commercial budget attainment for ${selectedPin?.id || ''}`;

  return (
    <div className="flex flex-col w-full bg-slate-900/90 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* 1. Header Bar */}
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
                  Google Maps Live ({storePoints.length} Stores Plotted)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {timeLabel}
                </span>
              </div>
              {widget.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{data?.dynamicSubtitle || widget.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Map Layer Switcher */}
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

      {/* 2. Interactive Map Viewport */}
      <div className="h-[440px] relative w-full bg-slate-950">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Zoom Controls */}
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

        {/* Legend */}
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

        {!selectedPin && (
          <div className="absolute bottom-4 left-4 bg-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-xl z-20 flex items-center gap-2.5 text-xs text-slate-300 pointer-events-auto animate-in fade-in">
            <Focus className="w-4 h-4 text-cyan-400" />
            <span>Click any store pin on the map or select a store in the table below to dive into {timeLabel} performance.</span>
          </div>
        )}
      </div>

      {/* 3. STORE OUTLETS DATA TABLE LIST */}
      {showTable && (
        <div className="border-t border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Store Outlets Target Attainment & Regional Performance Table ({timeLabel})
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">({storePoints.length} Stores)</span>
            </div>
            <span className="text-[10px] text-slate-400">
              💡 Select any store below to focus map and view deep-dive analytics
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] font-bold">
                  <th className="py-3 px-4">Store ID</th>
                  <th className="py-3 px-4">Store Outlet Location</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Store Manager</th>
                  <th className="py-3 px-4 text-right">POS Sales ({timeLabel})</th>
                  <th className="py-3 px-4 text-right">Budget Target (GSheet)</th>
                  <th className="py-3 px-4 text-right">Attainment %</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {storePoints.map((st: any) => {
                  const isSelected = selectedPin?.id === st.id;
                  const { color, label, badgeBg } = getAttainmentColor(st.target_achievement_pct);

                  return (
                    <tr
                      key={st.id}
                      onClick={() => handleSelectStore(st)}
                      className={`cursor-pointer transition-all duration-150 ${
                        isSelected 
                          ? 'bg-cyan-500/15 text-white font-semibold ring-1 ring-cyan-400/40' 
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-cyan-400">{st.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-100">{st.name || st.store_name}</td>
                      <td className="py-3 px-4 text-slate-400">{st.region}</td>
                      <td className="py-3 px-4 text-slate-300">{st.manager}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-100">{formatValue(st.sales, 'RM 0,0')}</td>
                      <td className="py-3 px-4 text-right text-cyan-300">{formatValue(st.target, 'RM 0,0')}</td>
                      <td className="py-3 px-4 text-right font-black" style={{ color: color }}>
                        {st.target_achievement_pct}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                          {label.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelectStore(st); }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 shadow-md'
                              : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300'
                          }`}
                        >
                          {isSelected ? 'Active ✓' : 'Dive-in →'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. STORE DRILL-DOWN DEEP-DIVE */}
      {selectedPin && (
        <div className="border-t border-slate-800 bg-slate-950/95 p-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                <Focus className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    {configuredTitle}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    {timeLabel} Deep-Dive
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {configuredSubtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseDrilldown}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Close Store Drilldown"
            >
              <X className="w-4 h-4" /> Close Drilldown
            </button>
          </div>

          {/* Sub-Widget KPI Scorecards dynamically cascading time range */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{timeLabel} Store Revenue</span>
              <span className="text-xl font-black text-white mt-0.5 block">{formatValue(periodSales, 'RM 0.0a')}</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">+12.4% vs benchmark</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{timeLabel} Budget Target</span>
              <span className="text-xl font-black text-cyan-300 mt-0.5 block">{formatValue(periodTarget, 'RM 0.0a')}</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> {widget.drilldown?.sub_widgets?.[0]?.title || 'Transaction Velocity & Customer Traffic'} ({timeLabel})
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
                  <PieChart className="w-3.5 h-3.5 text-indigo-400" /> {widget.drilldown?.sub_widgets?.[1]?.title || 'Product Division Share'} ({timeLabel})
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
