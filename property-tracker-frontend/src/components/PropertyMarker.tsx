// src/components/Map/PropertyMarker.tsx
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { useState } from 'react';
import type { EnhancedProperty } from '../types/property';
import './MapMarkers.css';

interface PropertyMarkerProps {
  property: EnhancedProperty;
}

export const PropertyMarker = ({ property }: PropertyMarkerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getMarkerColor = () => {
    if (property.status.toLowerCase() === 'vacant') return '#e74c3c';
    if (property.maintenance.urgentIssues > 0) return '#f39c12';
    return '#2ecc71';
  };

  const markerIcon = L.divIcon({
    className: `property-marker ${isHovered ? 'hovered' : ''}`,
    html: `
      <div class="marker-pin" style="background: ${getMarkerColor()}">
        ${property.maintenance.urgentIssues > 0 ? 
          `<span class="issue-count">${property.maintenance.urgentIssues}</span>` : ''}
      </div>
      <div class="marker-pulse ${isHovered ? 'active' : ''}" 
           style="background: ${getMarkerColor()}"></div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });

  return (
    <Marker
      position={[property.lat, property.lng]}
      icon={markerIcon}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: () => console.log('Marker clicked', property.id)
      }}
    >
      <Popup className="property-popup">
        <div className="popup-content">
          <h4>{property.name}</h4>
          <p>{property.address}</p>
          <div className="popup-stats">
            <div>
              <span>Value:</span>
              <span>${property.purchasePrice.toLocaleString()}</span>
            </div>
            <div>
              <span>Cash Flow:</span>
              <span className={property.financials.cashFlow >= 0 ? 'positive' : 'negative'}>
                ${property.financials.cashFlow.toLocaleString()}
              </span>
            </div>
            {property.photos?.[0] && (
              <img 
                src={property.photos[0]} 
                alt={property.name} 
                className="popup-photo" 
              />
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};