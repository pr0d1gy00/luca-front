"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationPickerMarker({ lat, lng, onChange }: MapPickerProps) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat && lng ? <Marker position={[lat, lng]} /> : null;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  // Default to Caracas, Venezuela if no location is provided
  const centerLat = lat || 10.4806;
  const centerLng = lng || -66.9036;

  // We add a subtle CSS filter to make it look slightly more "pharmako-care" teal 
  // instead of the default blue marker.
  return (
    <div className="w-full h-full relative z-0 [&_.leaflet-marker-icon]:hue-rotate-180">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={lat ? 16 : 12}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationPickerMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
