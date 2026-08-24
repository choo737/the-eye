import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WidgetSpec, ColorScaleSpec } from '../core/types';
import { MapPin, Navigation, Store, DollarSign, User, ShieldCheck, Flame, Globe, Satellite, Layers, HeartHandshake } from 'lucide-react';

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
    metric_field: 'nps_rating',
    min: 0,
    max: 100,
    min_color: '#ef4444',
    mid_color: '#eab308',
    max_color: '#22c55e'
  };

  const getNpsColor = (nps: number = 75): { color: string; label: string } => {
    const min = colorScale.min ?? 0;
    const max = colorScale.max ?? 100;
    const normalized = Math.max(0, Math.min(1, (nps - min) / (max - min)));

    if (normalized >= 0.8) {
      return { color: colorScale.max_color || '#22c55e', label: 'High' };
    } else if (normalized >= 0.6) {
      return { color: colorScale.mid_color || '#eab308', label: 'Medium' };
    } else {
      return { color: colorScale.min_color || '#ef4444', label: 'Low' };
    }
  };

  // Map Tile Providers (Real Google Maps and Carto)
  const TILE_URLS = {
    google_streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    google_satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Google Satellite Hybrid with Roads & Labels
    carto_dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [3.5, 103.5], // Center of Malaysia/Southeast Asia
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
      const nps = pin.nps_rating ?? 75;
      const { color } = getNpsColor(nps);
      const isSelected = selectedPin?.id === pin.id;

      // Custom HTML Pin Marker with Dynamic NPS Rating Color
      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(15, 23, 42, 0.95);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          border: 2px solid ${isSelected ? '#38bdf8' : color};
          box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 10px ${color}60;
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
            padding: 1px 4px;
            border-radius: 6px;
          ">★ ${nps}</span>
          <span style="font-size: 11px; font-weight: 700; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">
            ${pin.name}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-pin',
        iconSize: [160, 32],
        iconAnchor: [80, 16]
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

    // Auto-fit to filtered points
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
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              Google Maps Live ({mapData.length} Outlets)
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

        {/* Dynamic NPS Legend Bar (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 shadow-xl backdrop-blur-md z-20 flex flex-col gap-1.5 text-[11px] pointer-events-auto">
          <div className="flex items-center justify-between text-slate-300 font-bold gap-4">
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" /> NPS Rating Legend
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
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-88 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-20 animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedPin.id}
                </span>
                <span 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{
                    backgroundColor: `${getNpsColor(selectedPin.nps_rating).color}25`,
                    color: getNpsColor(selectedPin.nps_rating).color,
                    border: `1px solid ${getNpsColor(selectedPin.nps_rating).color}50`
                  }}
                >
                  ★ {selectedPin.nps_rating ?? 80} NPS
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
