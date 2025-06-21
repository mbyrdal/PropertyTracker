// src/components/PropertyMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Property } from '../types/property'; // Added 'type' keyword

// Fix marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
  properties: Property[]; // Now uses the shared Property type
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const center = properties[0] || { latitude: 51.505, longitude: -0.09 };

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        center={[center.latitude, center.longitude]} // Use latitude/longitude
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]} // Use latitude/longitude
          >
            <Popup>
              <b>{property.name}</b><br />
              {property.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}