import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { Property } from '../types/property';

// Fix missing marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function PropertyMap({ properties }: { properties: Property[] }) {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  const validProperties = properties.filter(p => p.latitude && p.longitude);
  
  if (validProperties.length === 0) {
    return <div className="no-properties">No properties with valid locations</div>;
  }

  const centerLat = validProperties.reduce((sum, p) => sum + p.latitude!, 0) / validProperties.length;
  const centerLng = validProperties.reduce((sum, p) => sum + p.longitude!, 0) / validProperties.length;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {validProperties.map(property => (
        <Marker
          key={property.id}
          position={[property.latitude!, property.longitude!]}
        >
          <Popup>
            <b>{property.name}</b><br />
            {property.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}