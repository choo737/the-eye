import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WidgetSpec, ColorScaleSpec } from '../core/types';
import { MapPin, Navigation, Store, DollarSign, User, ShieldCheck, Flame, Globe, Satellite, Layers, Target, TrendingUp, AlertTriangle } from 'lucide-react';

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

  const mapData = data?.mapPoints || [];
  const [selectedPin, setSelectedPin] = useState<any>(mapData[0] || null);
  const [mapStyle, setMapStyle] = useState<'google_streets' | 'google_satellite' | 'carto_dark'>('google_streets');

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

  const TILE_URLS = {
    google_streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    google_satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    carto_dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [3.5, 103.5],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true
      });

      const tileLayer = L.tileLayer(TILE_URLS[mapStyle], {
        maxZoom: 19,
        attribution: '© Google Maps'
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Update Map Style / Tiles
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      tileLayerRef.current.setUrl(TILE_URLS[mapStyle]);
    }
  }, [mapStyle]);

  // 3. Update Markers on Filter / Data change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (mapData.length === 0) return;

    const bounds = L.latLngBounds([]);

    mapData.forEach((pin: any) => {
      const attainmentPct = pin.target_achievement_pct ?? 100;
      const { color } = getAttainmentColor(attainmentPct);
      const isSelected = selectedPin?.id === pin.id;

      // Custom HTML Pin Marker with Target Attainment Status Badge
      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.95);
          color: white;
          padding: 5px 10px;
          border-radius: 14px;
          border: 2px solid ${isSelected ? '#38bdf8' : color};
          box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 12px ${color}70;
          font-family: ui-sans-serif, system-ui, sans-serif;
          white-space: nowrap;
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          <span style="
            background: ${color};
            color: #020617;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 8px;
            letter-spacing: 0.2px;
          ">${attainmentPct}% Target</span>
          <span style="font-size: 11px; font-weight: 700; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">
            ${pin.name}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-pin',
        iconSize: [180, 34],
        iconAnchor: [90, 17]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedPin(pin);
        if (onFilterChange && widget.interaction?.on_click_filter) {
          onFilterChange(widget.interaction.on_click_filter.filter_id, pin.region);
        }
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.extend([pin.lat, pin.lng]);
    });

    if (mapData.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    }
  }, [mapData, selectedPin, colorScale]);

  return (
    <div className="flex flex-col h-[520px] w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header Controls Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
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
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
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
            title="Google Earth Satellite Hybrid with Road Names"
          >
            <Satellite className="w-3.5 h-3.5" /> Google Satellite
          </button>
          <button
            onClick={() => setMapStyle('carto_dark')}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              mapStyle === 'carto_dark' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Clean Street Cartography"
          >
            <Layers className="w-3.5 h-3.5" /> Clean Streets
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <div className="flex-1 relative w-full h-full bg-slate-950">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Declarative Target Attainment Legend Bar (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-md z-20 flex flex-col gap-2 text-[11px] pointer-events-auto">
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
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-92 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-20 animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
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
