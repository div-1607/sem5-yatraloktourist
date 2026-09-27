import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon asset issue
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to dynamically adjust map center when coordinates change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = ({
  lat = 27.1751,
  lng = 78.0421,
  title = 'Destination Location',
  address = '',
  zoom = 13,
  className = 'h-72 w-full',
}) => {
  const position = [lat, lng];

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 shadow-lg relative ${className}`}>
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={position} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customMarkerIcon}>
          <Popup>
            <div className="text-navy-950 p-1">
              <h4 className="font-bold text-sm mb-1">{title}</h4>
              <p className="text-xs text-slate-600 mb-2">{address}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold underline"
              >
                Get Directions &rarr;
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
