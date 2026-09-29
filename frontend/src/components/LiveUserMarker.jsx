import React, { useEffect } from 'react';
import { Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Gauge, Shield, MapPin, Compass } from 'lucide-react';

// Custom smooth animated blue glowing marker
const liveGlowIcon = L.divIcon({
  className: 'live-gps-user-marker',
  html: `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
      <!-- Expanding ripple pulse 1 -->
      <span class="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-500 opacity-40"></span>
      <!-- Expanding ripple pulse 2 -->
      <span class="absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-30 animate-pulse"></span>
      
      <!-- Central glowing glass orb -->
      <div class="relative inline-flex rounded-full h-6 w-6 bg-gradient-to-tr from-blue-700 via-blue-500 to-sky-300 border-2 border-white shadow-[0_0_20px_#3B82F6,0_0_35px_rgba(59,130,246,0.6)] items-center justify-center">
        <!-- Inner white pulsating dot -->
        <div class="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse"></div>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const ChangeMapView = ({ coords, zoom = 17, shouldRecenter = false }) => {
  const map = useMap();
  const lastFlownRef = React.useRef(null);

  useEffect(() => {
    if (!coords || coords[0] == null || coords[1] == null) return;
    if (Number.isNaN(Number(coords[0])) || Number.isNaN(Number(coords[1]))) return;

    const isFirst = !lastFlownRef.current;
    let movedFar = false;
    if (lastFlownRef.current) {
      const dLat = Math.abs(coords[0] - lastFlownRef.current[0]);
      const dLng = Math.abs(coords[1] - lastFlownRef.current[1]);
      movedFar = dLat > 0.0004 || dLng > 0.0004; // ~40m
    }

    if (isFirst || shouldRecenter || movedFar) {
      lastFlownRef.current = coords;
      map.invalidateSize();
      map.setView(coords, Math.max(zoom, 16), {
        animate: true,
      });
    }
  }, [coords, zoom, shouldRecenter, map]);

  return null;
};

const LiveUserMarker = ({ position, coordinates, shouldRecenter = false, followUser = true, openPopup = true }) => {
  if (!position || position[0] == null || position[1] == null) return null;

  return (
    <>
      {followUser && <ChangeMapView coords={position} zoom={17} shouldRecenter={shouldRecenter} />}

      {/* Accuracy circle in meters */}
      {coordinates?.accuracy && (
        <Circle
          center={position}
          radius={Math.min(coordinates.accuracy, 250)}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#60A5FA',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 6',
          }}
        />
      )}

      {/* Animated glowing blue marker */}
      <Marker
        position={position}
        icon={liveGlowIcon}
        eventHandlers={
          openPopup
            ? {
                add: (e) => {
                  try {
                    e.target.openPopup();
                  } catch {
                    /* popup may not be ready */
                  }
                },
              }
            : undefined
        }
      >
        <Popup className="luxury-glass-popup">
          <div className="p-3 text-slate-100 font-sans min-w-[220px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-neon uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Your Exact Location
              </span>
              <span className="text-[10px] text-slate-400">
                ±{coordinates?.accuracy || 10}m
              </span>
            </div>

            {coordinates?.placeLabel && (
              <p className="text-[11px] text-blue-neon font-semibold mb-2 leading-snug">
                {coordinates.placeLabel}
              </p>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Latitude:</span>
                <span className="font-mono font-medium">{Number(position[0]).toFixed(6)}°</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Longitude:</span>
                <span className="font-mono font-medium">{Number(position[1]).toFixed(6)}°</span>
              </div>
              {coordinates?.speed !== undefined && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Speed:</span>
                  <span className="font-medium text-emerald-400">{coordinates.speed} km/h</span>
                </div>
              )}
              {coordinates?.altitude !== null && coordinates?.altitude !== undefined && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Altitude:</span>
                  <span className="font-medium text-sky-300">{coordinates.altitude} m</span>
                </div>
              )}
              {coordinates?.heading !== null && coordinates?.heading !== undefined && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Heading:</span>
                  <span className="font-medium text-indigo-300">{coordinates.heading}°</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Native Geolocation API</span>
              <span className="text-emerald-400 font-semibold">High Accuracy</span>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
};

export default LiveUserMarker;
