import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WidgetSpec, ColorScaleSpec } from '../core/types';
import { formatValue } from '../utils/formatters';
import { 
  Focus, Scan, MapPin, Store, DollarSign, User, ShieldCheck, 
  Globe, Satellite, Target, Plus, Minus, Compass, 
  TrendingUp, PieChart, X, Layers, Table as TableIcon,
  ChevronRight, ArrowUpDown, Calendar, Flame, CircleDot
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
  const timeRangeFilter = activeFilters['time_range'] || 'ytd';
  const timeLabel = typeof timeRangeFilter === 'object' && timeRangeFilter !== null
    ? (timeRangeFilter.label || `${timeRangeFilter.startDate} – ${timeRangeFilter.endDate}`)
    : ((timeRangeFilter === 'ytd' || timeRangeFilter === '2026-YTD') ? 'Year to Date (YTD)' 
    : timeRangeFilter === 'last_90_days' ? 'Last Quarter (90 Days)' 
    : timeRangeFilter === 'last_30_days' ? 'Last 30 Days' 
    : timeRangeFilter === 'today' ? 'Today' 
    : timeRangeFilter === 'yesterday' ? 'Yesterday' 
    : timeRangeFilter === 'last_7_days' ? 'Last 7 Days' 
    : '2026 YTD');

  // Fallback master stores dataset
  const defaultMasterStores = [
    { id: '7E-1082', store_id: '7E-1082', store_name: 'KLCC Twin Towers Concourse', name: 'KLCC Twin Towers Concourse', lat: 3.1578, lng: 101.7123, region: 'Klang Valley / Central', sales: 12450000, target: 14000000, manager: 'Ahmad Zaki', nps: 96, pos_count: 8 },
    { id: '7E-2041', store_id: '7E-2041', store_name: 'Mid Valley Megamall North Court', name: 'Mid Valley Megamall North Court', lat: 3.1189, lng: 101.6781, region: 'Klang Valley / Central', sales: 11200000, target: 12500000, manager: 'Michelle Tan', nps: 88, pos_count: 6 },
    { id: '7E-0492', store_id: '7E-0492', store_name: 'Gurney Plaza Waterfront', name: 'Gurney Plaza Waterfront', lat: 5.4377, lng: 100.3098, region: 'Northern Region', sales: 9450000, target: 10500000, manager: 'Rajeswary S.', nps: 84, pos_count: 5 },
    { id: '7E-3118', store_id: '7E-3118', store_name: 'JB City Square Customs Hub', name: 'JB City Square Customs Hub', lat: 1.4619, lng: 103.7638, region: 'Southern Region', sales: 10890000, target: 11500000, manager: 'Kevin Wong', nps: 78, pos_count: 6 },
    { id: '7E-0842', store_id: '7E-0842', store_name: 'KLIA2 Departure Hall Terminal', name: 'KLIA2 Departure Hall Terminal', lat: 2.7456, lng: 101.6841, region: 'Klang Valley / Central', sales: 14210000, target: 15000000, manager: 'Noraini Mohd', nps: 98, pos_count: 10 },
    { id: '7E-1934', store_id: '7E-1934', store_name: 'Ipoh Old Town Heritage', name: 'Ipoh Old Town Heritage', lat: 4.5975, lng: 101.0772, region: 'Northern Region', sales: 4680000, target: 6000000, manager: 'Chong Wei Lun', nps: 42, pos_count: 4 },
    { id: '7E-4421', store_id: '7E-4421', store_name: 'Kuantan Teluk Cempedak Beach', name: 'Kuantan Teluk Cempedak Beach', lat: 3.8168, lng: 103.3654, region: 'East Coast & Islands', sales: 4250000, target: 7000000, manager: 'Fatimah Ali', nps: 68, pos_count: 4 },
    { id: '7E-5512', store_id: '7E-5512', store_name: 'Kuching Waterfront Heritage', name: 'Kuching Waterfront Heritage', lat: 1.5583, lng: 110.3444, region: 'Sabah & Sarawak', sales: 4520000, target: 8500000, manager: 'Leonard Jabu', nps: 74, pos_count: 5 }
  ];

  // Dynamically resolve map points from Query Engine with strict property sanitation
  const storePoints = useMemo(() => {
    const rawList = (data?.mapPoints !== undefined) ? data.mapPoints : defaultMasterStores;
    return rawList.map((p: any) => {
      const storeName = p.name || p.store_name || p.branch_name || p.title || p.id || 'Location';
      const storeId = p.id || p.store_id || p.branch_code || 'LOC-001';
      const sales = typeof p.sales === 'number' ? p.sales : (typeof p.transaction_volume_myr === 'number' ? p.transaction_volume_myr : (typeof p.gross_revenue_myr === 'number' ? p.gross_revenue_myr : 10000000));
      const target = typeof p.target === 'number' ? p.target : (typeof p.deposit_target_myr === 'number' ? p.deposit_target_myr : (typeof p.monthly_budget_target === 'number' ? p.monthly_budget_target : sales));
      const attainmentPct = p.target_achievement_pct ?? (target > 0 ? Math.round((sales / target) * 1000) / 10 : 100);
      const manager = p.manager || p.store_manager || p.branch_manager || 'Branch Manager';
      const region = p.region || p.region_cluster || 'Malaysia';
      const nps = p.nps ?? (p.customer_nps ?? (p.nps_score ?? 88));
      const posCount = p.pos_count ?? (p.atm_count ?? (p.pos_terminal_count ?? 6));
      const state = p.state || 'Malaysia';

      return {
        ...p,
        id: storeId,
        store_id: storeId,
        branch_code: storeId,
        name: storeName,
        store_name: storeName,
        branch_name: storeName,
        sales,
        target,
        target_achievement_pct: attainmentPct,
        manager,
        region,
        state,
        nps,
        pos_count: posCount
      };
    });
  }, [data?.mapPoints]);

  const [selectedPin, setSelectedPin] = useState<any | null>(null);
  const [mapStyle, setMapStyle] = useState<'google_streets' | 'google_satellite' | 'google_terrain'>('google_streets');
  const [layerType, setLayerType] = useState<'pins' | 'heatmap' | 'bubbles'>(
    (widget.map_config?.layer_type as any) || (widget.type === 'heatmap' ? 'heatmap' : widget.type === 'bubble_map' ? 'bubbles' : 'pins')
  );
  const [showTableState, setShowTableState] = useState<boolean>(widget.map_config?.show_table !== false);

  // Preserve deep-dive selection on filter change & seamlessly reflect newly changed filter context
  useEffect(() => {
    if (selectedPin) {
      const updated = storePoints.find((p: any) => p.id === selectedPin.id);
      if (updated) {
        setSelectedPin(updated);
      }
    }
  }, [data, activeFilters, storePoints]);

  // Fit bounds when store points change
  useEffect(() => {
    if (mapInstanceRef.current && storePoints.length > 0) {
      const validPoints = storePoints.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [storePoints]);

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
          center: [4.2105, 101.9758],
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

  // 3. Render Markers, Heatmap, or Bubbles based on layerType
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    try {
      markersLayerRef.current.clearLayers();

      const maxSales = Math.max(...storePoints.map(p => p.sales || 1), 1);

      storePoints.forEach((pin: any) => {
        if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number') return;
        const isSelected = selectedPin?.id === pin.id;
        const displayName = pin.store_name || pin.name || pin.id || 'Location';
        const formattedSales = formatValue(pin.sales, 'RM 0.0a');

        if (layerType === 'heatmap') {
          // Heatmap layer: Multi-ring radial intensity gradient
          const intensity = Math.min(1.0, Math.max(0.3, pin.sales / maxSales));
          const outerRadius = 65000 * intensity;
          const innerRadius = 25000 * intensity;

          // Outer heat halo
          const outerCircle = L.circle([pin.lat, pin.lng], {
            radius: outerRadius,
            fillColor: '#f97316',
            fillOpacity: 0.25 * intensity,
            stroke: false
          });

          // Core hot spot
          const innerCircle = L.circle([pin.lat, pin.lng], {
            radius: innerRadius,
            fillColor: '#ef4444',
            fillOpacity: 0.65 * intensity,
            stroke: false
          });

          // Center pin
          const centerMarker = L.circleMarker([pin.lat, pin.lng], {
            radius: 5,
            fillColor: '#fef08a',
            fillOpacity: 0.9,
            color: '#fff',
            weight: 1.5
          }).bindTooltip(`<strong>${displayName}</strong><br/>Volume: ${formattedSales}`, { direction: 'top' });

          centerMarker.on('click', () => setSelectedPin(pin));
          outerCircle.on('click', () => setSelectedPin(pin));

          markersLayerRef.current?.addLayer(outerCircle);
          markersLayerRef.current?.addLayer(innerCircle);
          markersLayerRef.current?.addLayer(centerMarker);
        } else if (layerType === 'bubbles') {
          // Bubble Map: Circle radius scaled proportional to metric volume
          const radiusRatio = Math.sqrt(pin.sales / maxSales);
          const bubbleRadius = Math.max(12, Math.round(radiusRatio * 32));

          const bubble = L.circleMarker([pin.lat, pin.lng], {
            radius: bubbleRadius,
            fillColor: isSelected ? '#38bdf8' : '#0ea5e9',
            fillOpacity: 0.6,
            color: isSelected ? '#38bdf8' : '#38bdf8',
            weight: isSelected ? 3 : 1.5
          }).bindTooltip(`<strong>${displayName}</strong><br/>Volume: ${formattedSales}<br/>Region: ${pin.region}`, { direction: 'top' });

          bubble.on('click', () => setSelectedPin((prev: any) => (prev?.id === pin.id ? null : pin)));
          markersLayerRef.current?.addLayer(bubble);
        } else {
          // Pins Map: Clean location pin with formatted metric badge
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
                border: 2px solid ${isSelected ? '#38bdf8' : '#0284c7'};
                box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 14px #0284c780;
                font-family: ui-sans-serif, system-ui, sans-serif;
                white-space: nowrap;
              ">
                <span style="
                  background: #0284c7;
                  color: #ffffff;
                  font-size: 11px;
                  font-weight: 800;
                  padding: 2px 6px;
                  border-radius: 6px;
                ">${formattedSales}</span>
                <span style="font-size: 11px; font-weight: 800; color: #f8fafc; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">
                  ${displayName}
                </span>
              </div>

              <div style="
                width: 0;
                height: 0;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-top: 9px solid ${isSelected ? '#38bdf8' : '#0284c7'};
                margin-top: -1px;
              "></div>

              <div style="
                width: 5px;
                height: 5px;
                background: #0284c7;
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
          marker.on('click', () => setSelectedPin((prev: any) => (prev?.id === pin.id ? null : pin)));
          markersLayerRef.current?.addLayer(marker);
        }
      });
    } catch (err) {
      console.warn('Marker render:', err);
    }
  }, [selectedPin, mapStyle, layerType, colorScale, storePoints]);

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

  const getHourlyChartOption = () => {
    const dailyBase = selectedPin?.sales || 10000000;
    const xAxis = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const multipliers = [0.15, 0.4, 0.65, 0.8, 0.6, 0.45, 0.2];
    const dataSeries = multipliers.map(m => Math.round(dailyBase * m));

    return {
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any[]) => {
          return `<strong>${params[0].name}</strong><br/>Volume: ${formatValue(params[0].value, 'RM 0.0a')}`;
        }
      },
      grid: { top: 25, left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1e293b' } },
        axisLabel: { 
          color: '#94a3b8', 
          fontSize: 10, 
          formatter: (v: number) => formatValue(v, 'RM 0.0a') 
        }
      },
      series: [
        {
          name: 'Transaction Volume',
          type: 'line',
          smooth: true,
          data: dataSeries,
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
        }
      ]
    };
  };

  const isDarkTile = mapStyle === 'google_streets' || mapStyle === 'google_satellite';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            {data?.dynamicTitle || widget.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {data?.dynamicSubtitle || widget.subtitle || 'Geospatial intelligence and location distribution'}
          </p>
        </div>

        {/* Toolbar: Layer Type Switcher & Satellite Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Type Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setLayerType('pins')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                layerType === 'pins' ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Pins</span>
            </button>
            <button
              onClick={() => setLayerType('heatmap')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                layerType === 'heatmap' ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Heatmap</span>
            </button>
            <button
              onClick={() => setLayerType('bubbles')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                layerType === 'bubbles' ? 'bg-indigo-500/20 text-indigo-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Bubbles</span>
            </button>
          </div>

          {/* Map Tile Style Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMapStyle('google_streets')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mapStyle === 'google_streets' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Google Streets"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMapStyle('google_satellite')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mapStyle === 'google_satellite' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite View"
            >
              <Satellite className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table View Toggle */}
          <button
            onClick={() => setShowTableState(!showTableState)}
            className={`px-3 py-1 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              showTableState 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-800/80 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Floating Summary Badge */}
        <div className="absolute top-3 left-3 z-[400] bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Showing <strong>{storePoints.length}</strong> Locations</span>
          <span className="text-slate-600">|</span>
          <span>Layer: <strong className="capitalize text-cyan-300">{layerType}</strong></span>
        </div>

        {/* Selected Store Deep Dive Modal Drawer */}
        {selectedPin && (
          <div className="absolute right-3 top-3 bottom-3 w-80 sm:w-96 z-[500] bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{selectedPin.id}</span>
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedPin.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedPin.region} • {selectedPin.state}</p>
                </div>
                <button
                  onClick={handleCloseDrilldown}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Volume</span>
                  <p className="text-sm font-extrabold text-white font-mono">{formatValue(selectedPin.sales, 'RM 0.00a')}</p>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">NPS Score</span>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono">{selectedPin.nps} / 100</p>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Terminals / ATMs</span>
                  <p className="text-sm font-extrabold text-cyan-400 font-mono">{selectedPin.pos_count} Units</p>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Manager</span>
                  <p className="text-xs font-semibold text-slate-300 truncate">{selectedPin.manager}</p>
                </div>
              </div>

              {/* Hourly Velocity Chart */}
              <div className="mt-2">
                <span className="text-[11px] font-semibold text-slate-300 uppercase">Intraday Activity Stream</span>
                <div className="h-36 w-full mt-1">
                  <ReactECharts option={getHourlyChartOption()} style={{ height: '100%', width: '100%' }} />
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseDrilldown}
              className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-colors"
            >
              Close Deep Dive
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Tabular Breakdown View */}
      {showTableState && (
        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60 mt-1">
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
              Location Performance Directory ({storePoints.length} Locations)
            </span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Code / ID</th>
                  <th className="px-4 py-2.5">Location Name</th>
                  <th className="px-4 py-2.5">Region</th>
                  <th className="px-4 py-2.5 text-right">Volume</th>
                  <th className="px-4 py-2.5 text-center">NPS</th>
                  <th className="px-4 py-2.5">Manager</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
                {storePoints.map((store: any) => {
                  const isSelected = selectedPin?.id === store.id;
                  return (
                    <tr 
                      key={store.id} 
                      onClick={() => handleSelectStore(store)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/30 text-white font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-2 text-cyan-400 font-medium">{store.id}</td>
                      <td className="px-4 py-2 font-sans font-medium text-slate-200">{store.name}</td>
                      <td className="px-4 py-2 font-sans text-slate-400">{store.region}</td>
                      <td className="px-4 py-2 text-right font-bold text-white">{formatValue(store.sales, 'RM 0.00a')}</td>
                      <td className="px-4 py-2 text-center text-emerald-400">{store.nps}</td>
                      <td className="px-4 py-2 font-sans text-slate-400">{store.manager}</td>
                      <td className="px-4 py-2 text-center font-sans">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelectStore(store); }}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Inspect'}
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
    </div>
  );
};
