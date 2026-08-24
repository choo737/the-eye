import React, { useState } from 'react';
import { WidgetSpec } from '../core/types';
import { MapPin, Navigation, Layers, Store, DollarSign, User, ShieldCheck } from 'lucide-react';

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
  const [mapMode, setMapMode] = useState<'pins' | 'heatmap' | 'density'>('pins');

  const handlePinClick = (pin: any) => {
    setSelectedPin(pin);
    if (onFilterChange && widget.interaction?.on_click_filter) {
      onFilterChange(widget.interaction.on_click_filter.filter_id, pin.region);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
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
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMapMode('pins')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
              mapMode === 'pins' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Store Pins ({mapData.length})
          </button>
          <button
            onClick={() => setMapMode('heatmap')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
              mapMode === 'heatmap' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sales Heatmap
          </button>
        </div>
      </div>

      {/* Interactive Vector Map Canvas */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden min-h-[300px]">
        {/* Custom Dark Grid Geospatial Canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

        {/* Map Vector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <path d="M 120 180 Q 280 120, 480 200 T 800 150" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 220 280 Q 400 240, 600 320 T 920 220" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        {/* Geographic Store Pins */}
        <div className="absolute inset-0 p-6 flex flex-wrap items-center justify-around gap-6">
          {mapData.map((pin: any, idx: number) => {
            const isSelected = selectedPin?.id === pin.id;
            const salesIntensity = Math.min(1.0, pin.sales / 45000);

            return (
              <div
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                className={`relative group cursor-pointer transition-all duration-300 transform ${
                  isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                }`}
              >
                {/* Heatmap Aura */}
                {mapMode === 'heatmap' && (
                  <div
                    className="absolute -inset-6 rounded-full bg-cyan-400/20 blur-xl animate-pulse pointer-events-none"
                    style={{ transform: `scale(${1 + salesIntensity * 0.8})` }}
                  ></div>
                )}

                {/* Marker Pin */}
                <div className={`p-2.5 rounded-2xl border flex items-center gap-2 shadow-2xl backdrop-blur-md transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-cyan-500/30'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-cyan-400/60'
                }`}>
                  <Store className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[130px]">{pin.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                      ${(pin.sales / 1000).toFixed(1)}k / day
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Pin Detailed Info Card Overlay */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-lg z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {selectedPin.id}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {selectedPin.status}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mb-2">{selectedPin.name}</h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" /> Daily Revenue
                </span>
                <span className="text-sm font-bold text-slate-100">${(selectedPin.sales || 0).toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" /> Manager
                </span>
                <span className="text-xs font-bold text-slate-200 truncate block">{selectedPin.manager}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-cyan-400" /> Region: <strong className="text-slate-200">{selectedPin.region}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
