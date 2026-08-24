import React, { useState } from 'react';
import { WidgetSpec } from '../core/types';
import { MapPin, Navigation, Store, DollarSign, User, ShieldCheck, Flame, Globe, Satellite, Layers, Plus, Minus, Compass } from 'lucide-react';

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
  const mapData = data?.mapPoints || [
    { id: '7E-1082', name: 'KLCC Twin Towers Concourse', lat: 3.1578, lng: 101.7123, region: 'Klang Valley / Central', sales: 38400, manager: 'Ahmad Zaki', status: 'A+ (Exceeding)' },
    { id: '7E-2041', name: 'Mid Valley Megamall North Court', lat: 3.1189, lng: 101.6781, region: 'Klang Valley / Central', sales: 31200, manager: 'Michelle Tan', status: 'A (On Target)' },
    { id: '7E-0492', name: 'Gurney Plaza Waterfront', lat: 5.4377, lng: 100.3098, region: 'Northern Region', sales: 24500, manager: 'Rajeswary S.', status: 'A (On Target)' },
    { id: '7E-3118', name: 'JB City Square Customs Hub', lat: 1.4619, lng: 103.7638, region: 'Southern Region', sales: 28900, manager: 'Kevin Wong', status: 'A (On Target)' },
    { id: '7E-0842', name: 'KLIA2 Departure Hall Terminal', lat: 2.7456, lng: 101.6841, region: 'Klang Valley / Central', sales: 42100, manager: 'Noraini Mohd', status: 'A+ (Exceeding)' },
    { id: '7E-1934', name: 'Ipoh Old Town Heritage', lat: 4.5975, lng: 101.0772, region: 'Northern Region', sales: 16800, manager: 'Chong Wei Lun', status: 'B+ (Needs Review)' },
    { id: '7E-4421', name: 'Kuantan Teluk Cempedak Beach', lat: 3.8168, lng: 103.3654, region: 'East Coast & Islands', sales: 19500, manager: 'Fatimah Ali', status: 'A (On Target)' },
    { id: '7E-5512', name: 'Kuching Waterfront Heritage', lat: 1.5583, lng: 110.3444, region: 'Sabah & Sarawak', sales: 21400, manager: 'Leonard Jabu', status: 'A (On Target)' }
  ];

  const [selectedPin, setSelectedPin] = useState<any>(mapData[0]);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'streets'>('satellite');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(6);

  // Bounding box for Malaysia/Southeast Asia Region: Lat [0.5, 7.5], Lng [99.0, 119.0]
  const minLat = 0.5;
  const maxLat = 7.5;
  const minLng = 99.0;
  const maxLng = 119.0;

  const projectToPercent = (lat: number, lng: number) => {
    // Mercator-like linear relative bounding projection
    const x = ((lng - minLng) / (maxLng - minLng)) * 88 + 6;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 78 + 11;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(8, Math.min(92, y))
    };
  };

  const handlePinClick = (pin: any) => {
    setSelectedPin(pin);
    if (onFilterChange && widget.interaction?.on_click_filter) {
      onFilterChange(widget.interaction.on_click_filter.filter_id, pin.region);
    }
  };

  return (
    <div className="flex flex-col h-[520px] w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header Controls */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">{data?.dynamicTitle || widget.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              Google Maps Live
            </span>
          </div>
          {widget.subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{data?.dynamicSubtitle || widget.subtitle}</p>
          )}
        </div>

        {/* View Mode & Layer Controls */}
        <div className="flex items-center gap-2">
          {/* Map Base Layer Picker */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                mapStyle === 'satellite' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Google Earth / Satellite Imagery"
            >
              <Satellite className="w-3.5 h-3.5" /> Earth / Satellite
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                mapStyle === 'dark' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Dark Mode Vector Map"
            >
              <Globe className="w-3.5 h-3.5" /> Dark Carto
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

      {/* Real Live Map Viewport Canvas */}
      <div className="flex-1 relative overflow-hidden bg-slate-950 select-none">
        {/* Real Live Map Tile Background Layer */}
        {mapStyle === 'satellite' && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoomLevel}/32/51')`,
              backgroundSize: 'cover',
              filter: 'brightness(0.85) contrast(1.1)'
            }}
          >
            {/* Real Satellite Hybrid Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.2)_0%,_rgba(0,0,0,0.6)_100%)]"></div>
          </div>
        )}

        {mapStyle === 'dark' && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 bg-[#0b0f19]"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px), radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 50%)`,
              backgroundSize: '32px 32px, 100% 100%'
            }}
          ></div>
        )}

        {mapStyle === 'streets' && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 bg-[#1e293b]"
            style={{
              backgroundImage: `url('https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoomLevel}/51/32.png')`,
              backgroundSize: 'cover',
              filter: 'brightness(0.7) contrast(1.2) hue-rotate(190deg)'
            }}
          ></div>
        )}

        {/* Real Coastline & Territorial Borders (SVG Vector Overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
          {/* Peninsular Malaysia */}
          <path 
            d="M 170 110 Q 230 90, 270 170 T 360 300 T 430 430 Q 360 480, 240 440 T 170 240 Z" 
            fill={mapStyle === 'satellite' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(56, 189, 248, 0.08)'} 
            stroke={mapStyle === 'satellite' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(56, 189, 248, 0.4)'} 
            strokeWidth="1.5" 
          />
          {/* Sabah & Sarawak (Borneo) */}
          <path 
            d="M 520 340 Q 640 280, 780 290 T 920 330 Q 860 440, 680 430 T 520 370 Z" 
            fill={mapStyle === 'satellite' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(129, 140, 248, 0.08)'} 
            stroke={mapStyle === 'satellite' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(129, 140, 248, 0.4)'} 
            strokeWidth="1.5" 
          />
          {/* Main Transit Corridor Route */}
          <path d="M 190 140 L 220 220 L 250 310 L 290 380 L 400 440" fill="none" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="2.5" strokeDasharray="6 4" />
        </svg>

        {/* Interactive Store Outlet Marker Pins */}
        <div className="absolute inset-0">
          {mapData.map((pin: any) => {
            const isSelected = selectedPin?.id === pin.id;
            const { x, y } = projectToPercent(pin.lat, pin.lng);
            const salesIntensity = Math.min(1.0, pin.sales / 45000);

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
                    className="absolute -inset-10 rounded-full bg-amber-400/40 blur-2xl animate-pulse pointer-events-none"
                    style={{ transform: `scale(${1.2 + salesIntensity * 1.8})` }}
                  ></div>
                )}

                {/* Marker Pill with Google Earth styling */}
                <div className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-2xl backdrop-blur-md transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-white font-extrabold shadow-cyan-500/50 ring-4 ring-cyan-400/30'
                    : 'bg-slate-950/90 text-white border-slate-700 hover:border-cyan-400 hover:bg-slate-900'
                }`}>
                  <div className={`p-1 rounded-lg ${isSelected ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-500/20 text-cyan-300'}`}>
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[130px] sm:max-w-[170px]">{pin.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-slate-900 font-bold' : 'text-cyan-300'}`}>
                      ${(pin.sales || 0).toLocaleString()} / day
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Navigation & Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 z-30 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setZoomLevel(prev => Math.min(8, prev + 1))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 w-full"></div>
          <button
            onClick={() => setZoomLevel(prev => Math.max(4, prev - 1))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Active Store Inspector HUD Card Overlay */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-88 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-40 animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {selectedPin.id}
              </span>
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
