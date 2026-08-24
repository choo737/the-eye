import React, { useState } from 'react';
import { WidgetSpec } from '../core/types';
import { MapPin, Navigation, Layers, Store, DollarSign, User, ShieldCheck, Flame, Compass, Maximize2 } from 'lucide-react';

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
    { id: '7E-1082', name: 'KLCC Twin Towers Concourse', lat: 3.1578, lng: 101.7123, x: 28, y: 48, region: 'Klang Valley / Central', sales: 38400, manager: 'Ahmad Zaki', status: 'A+ (Exceeding)' },
    { id: '7E-2041', name: 'Mid Valley Megamall North Court', lat: 3.1189, lng: 101.6781, x: 34, y: 56, region: 'Klang Valley / Central', sales: 31200, manager: 'Michelle Tan', status: 'A (On Target)' },
    { id: '7E-0492', name: 'Gurney Plaza Waterfront', lat: 5.4377, lng: 100.3098, x: 20, y: 22, region: 'Northern Region', sales: 24500, manager: 'Rajeswary S.', status: 'A (On Target)' },
    { id: '7E-3118', name: 'JB City Square Customs Hub', lat: 1.4619, lng: 103.7638, x: 48, y: 78, region: 'Southern Region', sales: 28900, manager: 'Kevin Wong', status: 'A (On Target)' },
    { id: '7E-0842', name: 'KLIA2 Departure Hall Terminal', lat: 2.7456, lng: 101.6841, x: 30, y: 64, region: 'Klang Valley / Central', sales: 42100, manager: 'Noraini Mohd', status: 'A+ (Exceeding)' },
    { id: '7E-1934', name: 'Ipoh Old Town Heritage', lat: 4.5975, lng: 101.0772, x: 25, y: 35, region: 'Northern Region', sales: 16800, manager: 'Chong Wei Lun', status: 'B+ (Needs Review)' },
    { id: '7E-4421', name: 'Kuantan Teluk Cempedak Beach', lat: 3.8168, lng: 103.3654, x: 46, y: 44, region: 'East Coast & Islands', sales: 19500, manager: 'Fatimah Ali', status: 'A (On Target)' },
    { id: '7E-5512', name: 'Kuching Waterfront Heritage', lat: 1.5583, lng: 110.3444, x: 78, y: 72, region: 'Sabah & Sarawak', sales: 21400, manager: 'Leonard Jabu', status: 'A (On Target)' }
  ];

  const [selectedPin, setSelectedPin] = useState<any>(mapData[0]);
  const [mapMode, setMapMode] = useState<'pins' | 'heatmap'>('pins');

  const handlePinClick = (pin: any) => {
    setSelectedPin(pin);
    if (onFilterChange && widget.interaction?.on_click_filter) {
      onFilterChange(widget.interaction.on_click_filter.filter_id, pin.region);
    }
  };

  return (
    <div className="flex flex-col h-[480px] w-full bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900">
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

        {/* Map Layer Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMapMode('pins')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              mapMode === 'pins' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Store Pins ({mapData.length})
          </button>
          <button
            onClick={() => setMapMode('heatmap')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              mapMode === 'heatmap' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Sales Heatmap
          </button>
        </div>
      </div>

      {/* High-Fidelity Geospatial Map Canvas */}
      <div className="flex-1 relative bg-[#090d16] overflow-hidden min-h-[380px]">
        {/* Dark Mode Carto Vector Map Background */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px]"></div>

        {/* Regional Territory Geometries & Road Network */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path d="M 160 100 Q 240 80, 320 180 T 480 340 T 520 480 Q 420 540, 260 480 T 180 260 Z" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
          <path d="M 600 380 Q 740 320, 880 360 T 960 440 Q 840 520, 680 480 Z" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(129, 140, 248, 0.25)" strokeWidth="1.5" />
          
          <path d="M 210 130 L 260 210 L 290 290 L 320 380 L 490 470" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" strokeDasharray="6 4" />
          <path d="M 290 290 L 460 260" fill="none" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        {/* Geographic Markers & Store Pins */}
        <div className="absolute inset-0">
          {mapData.map((pin: any) => {
            const isSelected = selectedPin?.id === pin.id;
            const salesIntensity = Math.min(1.0, pin.sales / 45000);

            const posX = pin.x || 30;
            const posY = pin.y || 40;

            return (
              <div
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'
                }`}
              >
                {/* Heatmap Glow Aura */}
                {mapMode === 'heatmap' && (
                  <div
                    className="absolute -inset-8 rounded-full bg-cyan-400/30 blur-xl animate-pulse pointer-events-none"
                    style={{ transform: `scale(${1.2 + salesIntensity * 1.5})` }}
                  ></div>
                )}

                {/* Marker Pill */}
                <div className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xl backdrop-blur-md transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-cyan-500/40 ring-4 ring-cyan-500/20'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700/90 hover:border-cyan-400 hover:bg-slate-800'
                }`}>
                  <Store className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[120px] sm:max-w-[160px]">{pin.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                      ${(pin.sales || 0).toLocaleString()} / day
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Store Inspector Drawer (HUD) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-84 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-40 animate-in fade-in slide-in-from-bottom-3">
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
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" /> Daily Revenue
                </span>
                <span className="text-sm font-bold text-cyan-300">${(selectedPin.sales || 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" /> Store Manager
                </span>
                <span className="text-xs font-bold text-slate-200 truncate block">{selectedPin.manager}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Region: <strong className="text-slate-200">{selectedPin.region}</strong>
              </span>
              <span className="text-[10px] text-cyan-400 underline cursor-pointer hover:text-cyan-300">
                Filter Dashboard ↗
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
