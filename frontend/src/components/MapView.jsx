import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import LiveUserMarker from './LiveUserMarker';
import { useLiveLocation } from '../context/LiveLocationContext';

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const FreeTileLayer = () => (
  <TileLayer attribution={OSM_TILE_ATTRIBUTION} url={OSM_TILE_URL} />
);

const destinationIcon = L.divIcon({
  className: 'custom-neon-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-50"></span>
      <div class="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-white shadow-[0_0_15px_#F59E0B] items-center justify-center">
        <div class="h-2 w-2 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const FitDestinationAndUser = ({ dest, user }) => {
  const map = useMap();
  useEffect(() => {
    if (!dest || !user) return;
    try {
      map.fitBounds([dest, user], { padding: [48, 48], maxZoom: 15, animate: true });
    } catch {
      /* bounds may be invalid on first paint */
    }
  }, [dest, user, map]);
  return null;
};

const MapView = ({
  lat = 27.1751,
  lng = 78.0421,
  title = 'Destination Location',
  address = '',
  zoom = 13,
  className = 'h-72 w-full',
  showLiveUser = true,
}) => {
  const position = [Number(lat), Number(lng)];
  const {
    userLocation,
    coordinates,
    hasFix,
    permissionStatus,
    error,
    startTracking,
    isTracking,
    getDistanceMeters,
  } = useLiveLocation();

  const livePos = hasFix && userLocation ? userLocation : null;
  const distanceMeters = livePos ? getDistanceMeters(position[0], position[1]) : null;

  return (
    <div className={`overflow-hidden rounded-2xl border border-blue-electric/25 shadow-glass-card relative ${className}`}>
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full bg-black-midnight yatralok-map"
      >
        <ChangeView center={position} zoom={zoom} />
        {livePos && <FitDestinationAndUser dest={position} user={livePos} />}
        <FreeTileLayer />

        <Marker position={position} icon={destinationIcon}>
          <Popup>
            <div className="text-white p-1">
              <h4 className="font-bold text-sm mb-1 text-blue-neon">{title}</h4>
              <p className="text-xs text-slate-300 mb-2">{address}</p>
              {distanceMeters != null && (
                <p className="text-xs text-emerald-400 mb-2 font-semibold">
                  {distanceMeters >= 1000
                    ? `${(distanceMeters / 1000).toFixed(2)} km from you`
                    : `${Math.round(distanceMeters)} m from you`}
                </p>
              )}
              <a
                href={`https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-electric hover:underline font-semibold"
              >
                Open directions &rarr;
              </a>
            </div>
          </Popup>
        </Marker>

        {showLiveUser && livePos && (
          <>
            <Polyline
              positions={[livePos, position]}
              pathOptions={{ color: '#60A5FA', weight: 2, opacity: 0.7, dashArray: '6, 8' }}
            />
            <LiveUserMarker position={livePos} coordinates={coordinates} followUser={false} />
          </>
        )}
      </MapContainer>

      {showLiveUser && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
          <div className="pointer-events-auto max-w-md p-3 rounded-xl bg-black-midnight/90 border border-blue-electric/30 backdrop-blur-xl shadow-glass flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-neon">
                {hasFix ? 'Live GPS lock' : 'Browser geolocation'}
              </p>
              <p className="text-xs text-slate-300 truncate">
                {hasFix
                  ? `${userLocation[0].toFixed(5)}° N, ${userLocation[1].toFixed(5)}° E · ±${coordinates?.accuracy || 0}m`
                  : permissionStatus === 'denied'
                    ? 'Location permission denied. Allow access in the address bar.'
                    : error || 'Share your location to plot you on this map.'}
              </p>
            </div>
            {!isTracking && (
              <button
                type="button"
                onClick={startTracking}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-electric/20 border border-blue-electric/40 text-blue-neon text-[11px] font-bold"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                Enable GPS
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
