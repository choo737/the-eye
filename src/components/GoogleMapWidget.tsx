import React, { useState, useRef } from 'react';
import { WidgetSpec, ColorScaleSpec } from '../core/types';
import { MapPin, Navigation, Store, DollarSign, User, ShieldCheck, Globe, Satellite, Layers, Target, Plus, Minus, Move, Compass } from 'lucide-react';

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
  const [mapStyle, setMapStyle] = useState<'google_streets' | 'google_satellite' | 'carto_dark'>('google_streets');

  // Interactive Pan & Zoom Transform State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Extract declarative color scale from YAML configuration
  const colorScale: ColorScaleSpec = widget.map_config?.color_scale || {
    metric_field: 'target_achievement_pct',
    min: 80,
    max: 110,
    min_color: '#ef4444', // Red for <90% (At Risk)
    mid_color: '#eab308', // Amber for 90-99.9% (Warning)
    max_color: '#22c55e'  // Green for >=100% (On Track)
  };

  /**
   * Computes color based on whether store meets the revenue target
   */
  const getAttainmentColor = (pct: number = 100): { color: string; label: string; status: 'on_track' | 'warning' | 'at_risk' } => {
    if (pct >= 100) {
      return { color: colorScale.max_color || '#22c55e', label: 'On Track (≥100%)', status: 'on_track' };
    } else if (pct >= 90) {
      return { color: colorScale.mid_color || '#eab308', label: 'Near Target (90-99%)', status: 'warning' };
    } else {
      return { color: colorScale.min_color || '#ef4444', label: 'At Risk (<90%)', status: 'at_risk' };
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom(prev => Math.max(0.7, Math.min(2.8, prev + zoomDelta)));
  };

  const handlePinClick = (e: React.MouseEvent, pin: any) => {
    e.stopPropagation();
    setSelectedPin(pin);
    if (onFilterChange && widget.interaction?.on_click_filter) {
      onFilterChange(widget.interaction.on_click_filter.filter_id, pin.region);
    }
  };

  return (
    <div className="flex flex-col h-[520px] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl select-none">
      {/* Header Controls Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0 z-30">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">{data?.dynamicTitle || widget.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Google Sheets Target Mesh ({mapData.length} Outlets)
            </span>
          </div>
          {widget.subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{data?.dynamicSubtitle || widget.subtitle}</p>
          )}
        </div>

        {/* Real Live Map Layer Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMapStyle('google_streets')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'google_streets' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Google Maps Standard Roadmap"
          >
            <Globe className="w-3.5 h-3.5" /> Google Roadmap
          </button>
          <button
            onClick={() => setMapStyle('google_satellite')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'google_satellite' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Google Earth Satellite Hybrid"
          >
            <Satellite className="w-3.5 h-3.5" /> Google Satellite
          </button>
          <button
            onClick={() => setMapStyle('carto_dark')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'carto_dark' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Modern Dark Cartography"
          >
            <Layers className="w-3.5 h-3.5" /> Dark Carto
          </button>
        </div>
      </div>

      {/* Interactive Map Viewport Canvas */}
      <div 
        className={`flex-1 relative overflow-hidden ${
          mapStyle === 'google_streets' ? 'bg-[#0e1726]' :
          mapStyle === 'google_satellite' ? 'bg-[#08131a]' : 'bg-[#090d16]'
        } cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Animated Pan & Zoom Layer Container */}
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-75 origin-center pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* Cartographic Coordinate Grid */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]"></div>

          {/* High-Resolution Vector Topography, Coastlines & Highways */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="peninsularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mapStyle === 'google_satellite' ? '#166534' : '#1e293b'} stopOpacity="0.85" />
                <stop offset="100%" stopColor={mapStyle === 'google_satellite' ? '#14532d' : '#0f172a'} stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="borneoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mapStyle === 'google_satellite' ? '#15803d' : '#1e293b'} stopOpacity="0.85" />
                <stop offset="100%" stopColor={mapStyle === 'google_satellite' ? '#14532d' : '#0f172a'} stopOpacity="0.95" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Peninsular Malaysia Coastline & Territory */}
            <path 
              d="M 180 110 Q 230 80, 280 160 T 360 280 T 430 430 Q 370 480, 240 450 T 180 240 Z" 
              fill="url(#peninsularGrad)" 
              stroke={mapStyle === 'google_streets' ? '#38bdf8' : mapStyle === 'google_satellite' ? '#4ade80' : '#818cf8'} 
              strokeWidth="2" 
              strokeOpacity="0.7"
              filter="url(#glowEffect)"
            />

            {/* Sabah & Sarawak (Borneo Island) Territory */}
            <path 
              d="M 520 340 Q 640 280, 780 290 T 920 330 Q 860 440, 680 430 T 520 370 Z" 
              fill="url(#borneoGrad)" 
              stroke={mapStyle === 'google_streets' ? '#38bdf8' : mapStyle === 'google_satellite' ? '#4ade80' : '#818cf8'} 
              strokeWidth="2" 
              strokeOpacity="0.7"
              filter="url(#glowEffect)"
            />

            {/* Major Inter-City Logistics Highways */}
            <path d="M 200 130 L 230 210 L 260 290 L 300 370 L 410 440" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" strokeOpacity="0.8" />
            <path d="M 260 290 L 410 270" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.7" />
          </svg>

          {/* Dynamic Store Markers Colored by Target Attainment */}
          <div className="absolute inset-0 pointer-events-auto">
            {mapData.map((pin: any) => {
              const isSelected = selectedPin?.id === pin.id;
              const attainmentPct = pin.target_achievement_pct ?? 100;
              const { color } = getAttainmentColor(attainmentPct);
              const { x, y } = projectToPercent(pin.lat, pin.lng);

              return (
                <div
                  key={pin.id}
                  onClick={(e) => handlePinClick(e, pin)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 transform ${
                    isSelected ? 'scale-115 z-40' : 'hover:scale-108 z-20'
                  }`}
                >
                  {/* Dynamic Pulsing Halo */}
                  <div
                    className="absolute -inset-6 rounded-full blur-lg animate-pulse pointer-events-none"
                    style={{ backgroundColor: `${color}40` }}
                  ></div>

                  {/* Marker Pill with Dynamic Attainment % */}
                  <div 
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-2xl backdrop-blur-md transition ${
                      isSelected
                        ? 'bg-slate-900 text-white ring-4 ring-cyan-400/40'
                        : 'bg-slate-950/95 text-slate-200 hover:bg-slate-900'
                    }`}
                    style={{ borderColor: isSelected ? '#38bdf8' : color }}
                  >
                    {/* Attainment Badge */}
                    <span 
                      className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-extrabold flex items-center gap-0.5 shadow-sm text-slate-950"
                      style={{ backgroundColor: color }}
                    >
                      {attainmentPct}% Target
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
        </div>

        {/* Floating Zoom & Pan Navigation Controls (Top Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-30 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setZoom(prev => Math.min(2.8, prev + 0.2))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 w-full"></div>
          <button
            onClick={() => setZoom(prev => Math.max(0.7, prev - 0.2))}
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
        <div className="absolute bottom-4 right-4 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-md z-30 flex flex-col gap-2 text-[11px] pointer-events-auto">
          <div className="flex items-center justify-between text-slate-300 font-bold gap-4">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Revenue Target Attainment
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

        {/* Selected Store Inspector HUD Card Overlay (Bottom Left) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-92 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-30 animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedPin.id}
                </span>
                {/* Dynamic Attainment Badge */}
                <span 
                  className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{
                    backgroundColor: `${getAttainmentColor(selectedPin.target_achievement_pct).color}25`,
                    color: getAttainmentColor(selectedPin.target_achievement_pct).color,
                    border: `1px solid ${getAttainmentColor(selectedPin.target_achievement_pct).color}50`
                  }}
                >
                  <Target className="w-3 h-3" /> {selectedPin.target_achievement_pct ?? 100}% Attainment
                </span>
              </div>
              <span className="text-xs font-bold text-slate-200">
                {selectedPin.status}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mb-2.5 leading-snug">{selectedPin.name}</h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" /> Daily Revenue (BQ)
                </span>
                <span className="text-sm font-bold text-white">${(selectedPin.sales || 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" /> Target (GSheet)
                </span>
                <span className="text-sm font-bold text-emerald-400">${(selectedPin.target || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Manager: <strong className="text-slate-200">{selectedPin.manager}</strong>
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
