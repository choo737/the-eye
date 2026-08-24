import React, { useState } from 'react';
import { WidgetSpec, ColorScaleSpec } from '../core/types';
import { MapPin, Navigation, Store, DollarSign, User, ShieldCheck, Flame, Globe, Satellite, Layers, Plus, Minus, Star, HeartHandshake } from 'lucide-react';

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
  const mapData = data?.mapPoints || [];
  const [selectedPin, setSelectedPin] = useState<any>(mapData[0] || null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  // Extract declarative color scale from YAML configuration
  const colorScale: ColorScaleSpec = widget.map_config?.color_scale || {
    metric_field: 'nps_rating',
    min: 0,
    max: 100,
    min_color: '#ef4444', // Red for 0
    mid_color: '#eab308', // Yellow for 50
    max_color: '#22c55e'  // Green for 100
  };

  /**
   * Dynamically computes the hex color and badge style based on the configured color scale
   */
  const getNpsColor = (nps: number = 75): { color: string; bgClass: string; textClass: string; borderClass: string } => {
    const min = colorScale.min ?? 0;
    const max = colorScale.max ?? 100;
    const normalized = Math.max(0, Math.min(1, (nps - min) / (max - min)));

    if (normalized >= 0.8) {
      return {
        color: colorScale.max_color || '#22c55e',
        bgClass: 'bg-emerald-500/20',
        textClass: 'text-emerald-400',
        borderClass: 'border-emerald-500/40'
      };
    } else if (normalized >= 0.6) {
      return {
        color: colorScale.mid_color || '#eab308',
        bgClass: 'bg-amber-500/20',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/40'
      };
    } else {
      return {
        color: colorScale.min_color || '#ef4444',
        bgClass: 'bg-rose-500/20',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-500/40'
      };
    }
  };

  // Geographic Bounding Box for Malaysia/Southeast Asia Region: Lat [0.8, 7.2], Lng [99.5, 118.5]
  const minLat = 0.8;
  const maxLat = 7.2;
  const minLng = 99.5;
  const maxLng = 118.5;

  const projectToPercent = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 84 + 8;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 74 + 13;
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  const handlePinClick = (pin: any) => {
    setSelectedPin(pin);
    if (onFilterChange && widget.interaction?.on_click_filter) {
      onFilterChange(widget.interaction.on_click_filter.filter_id, pin.region);
    }
  };

  return (
    <div className="flex flex-col h-[520px] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">{data?.dynamicTitle || widget.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              Google Maps Live ({mapData.length} Outlets)
            </span>
          </div>
          {widget.subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{data?.dynamicSubtitle || widget.subtitle}</p>
          )}
        </div>

        {/* View Mode & Layer Controls */}
        <div className="flex items-center gap-2">
          {/* Map Base Layer Picker */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                mapStyle === 'dark' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Crisp Dark Mode Vector Map"
            >
              <Globe className="w-3.5 h-3.5" /> Dark Carto
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                mapStyle === 'satellite' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite Earth Imagery"
            >
              <Satellite className="w-3.5 h-3.5" /> Satellite
            </button>
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                mapStyle === 'streets' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Roadmap & Terrain"
            >
              <Layers className="w-3.5 h-3.5" /> Streets
            </button>
          </div>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
              showHeatmap ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Sales Density Heatmap"
          >
            <Flame className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Crystal-Clear Vector Geospatial Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#070b14] select-none">
        {/* Crisp High-DPI Background Grid */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* High-Resolution SVG Geographic Contours & Highways (Crisp, Never Blur) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Peninsular Malaysia Coastline & Landmass */}
          <path 
            d="M 180 110 Q 230 80, 280 160 T 360 280 T 430 430 Q 370 480, 240 450 T 180 240 Z" 
            fill="url(#landGradient)" 
            stroke="#38bdf8" 
            strokeWidth="1.8" 
            strokeOpacity="0.4"
            filter="url(#glow)"
          />

          {/* Sabah & Sarawak (Borneo Island) Landmass */}
          <path 
            d="M 520 340 Q 640 280, 780 290 T 920 330 Q 860 440, 680 430 T 520 370 Z" 
            fill="url(#landGradient)" 
            stroke="#818cf8" 
            strokeWidth="1.8" 
            strokeOpacity="0.4"
            filter="url(#glow)"
          />

          {/* Inter-City Logistics & Expressways */}
          <path d="M 200 130 L 230 210 L 260 290 L 300 370 L 410 440" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="6 4" strokeOpacity="0.7" />
          <path d="M 260 290 L 410 270" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
        </svg>

        {/* Dynamic Store Markers Colored by NPS Rating */}
        <div className="absolute inset-0">
          {mapData.map((pin: any) => {
            const isSelected = selectedPin?.id === pin.id;
            const nps = pin.nps_rating ?? 75;
            const npsTheme = getNpsColor(nps);
            const { x, y } = projectToPercent(pin.lat, pin.lng);

            return (
              <div
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
                }`}
              >
                {/* Heatmap Aura */}
                {showHeatmap && (
                  <div
                    className="absolute -inset-10 rounded-full blur-2xl animate-pulse pointer-events-none"
                    style={{ backgroundColor: `${npsTheme.color}50` }}
                  ></div>
                )}

                {/* Marker Pill with Dynamic NPS Color Rating */}
                <div className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-2xl backdrop-blur-md transition ${
                  isSelected
                    ? 'bg-slate-900 text-white border-white ring-4 ring-cyan-500/30'
                    : 'bg-slate-950/95 text-slate-200 border-slate-700/80 hover:border-slate-400'
                }`}>
                  {/* NPS Rating Badge */}
                  <span 
                    className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-extrabold flex items-center gap-0.5 shadow-sm"
                    style={{ backgroundColor: `${npsTheme.color}25`, color: npsTheme.color, border: `1px solid ${npsTheme.color}50` }}
                  >
                    <Star className="w-2.5 h-2.5 fill-current" /> {nps}
                  </span>

                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[130px] sm:max-w-[160px] text-slate-100">{pin.name}</div>
                    <div className="text-[10px] text-slate-400">
                      ${(pin.sales || 0).toLocaleString()} / day
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Declarative NPS Rating Legend Bar (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 shadow-xl backdrop-blur-md z-30 flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-300 font-bold gap-4">
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" /> Customer NPS Rating Scale
            </span>
            <span className="text-[10px] text-slate-400 font-mono">0 - 100</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
            <span className="text-rose-400">0 (Red)</span>
            <div className="w-28 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 border border-slate-700"></div>
            <span className="text-emerald-400">100 (Green)</span>
          </div>
        </div>

        {/* Selected Store Inspector HUD Card Overlay (Bottom Left) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-88 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-40 animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedPin.id}
                </span>
                {/* Dynamic NPS Score */}
                <span 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{
                    backgroundColor: `${getNpsColor(selectedPin.nps_rating).color}25`,
                    color: getNpsColor(selectedPin.nps_rating).color,
                    border: `1px solid ${getNpsColor(selectedPin.nps_rating).color}50`
                  }}
                >
                  <Star className="w-3 h-3 fill-current" /> {selectedPin.nps_rating ?? 80} NPS
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {selectedPin.status}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mb-2.5 leading-snug">{selectedPin.name}</h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" /> Daily Revenue
                </span>
                <span className="text-sm font-bold text-cyan-300">${(selectedPin.sales || 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" /> Store Manager
                </span>
                <span className="text-xs font-bold text-slate-200 truncate block">{selectedPin.manager}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Region: <strong className="text-slate-200">{selectedPin.region}</strong>
              </span>
              <span className="text-[10px] text-cyan-400 font-bold underline cursor-pointer hover:text-cyan-300">
                GPS: {selectedPin.lat?.toFixed(2)}°, {selectedPin.lng?.toFixed(2)}°
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
