import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Home, Landmark, Receipt, TrendingUp, Percent, 
  AlertTriangle, BadgeInfo, Square 
} from "lucide-react";
import type { EnhancedProperty } from "../types/property";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EnhancedPropertyMapProps {
  properties: EnhancedProperty[];
  totalYield?: number;
}

const PortfolioHeader = ({ properties, totalYield }: { properties: EnhancedProperty[], totalYield?: number }) => {
  return (
    <div className="portfolio-header">
      <h1 className="portfolio-title">Property Portfolio Map</h1>
      <div className="portfolio-stats">
        <span className="stat-item">
          <strong>Total Properties:</strong> {properties.length}
        </span>
        {totalYield && (
          <span className="stat-item">
            <strong>Avg Yield:</strong> {totalYield.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

const SmartPopup = ({ property }: { property: EnhancedProperty }) => {
  const popupRef = React.useRef<L.Popup>(null);

  React.useEffect(() => {
    if (popupRef.current) {
      const popup = popupRef.current;
      popup.options.autoPan = true;
      popup.options.maxWidth = 280;
      popup.options.minWidth = 240;
      popup.options.autoPanPadding = [20, 20];
      popup.options.offset = L.point(0, -10);
    }
  }, []);

  return (
    <Popup ref={popupRef} className="compact-popup">
      <div className="popup-content">
        <div className="popup-header">
          <Home className="icon-sm text-blue-600" />
          <h3 className="popup-title">{property.name}</h3>
          <div className={`status-badge ${property.status.toLowerCase()}`}>
            <BadgeInfo className="icon-xs" />
            <span>{property.status}</span>
          </div>
        </div>
        
        <div className="popup-grid">
          <div className="grid-item">
            <Landmark className="icon-xs" />
            <span className="label">Price</span>
            <span className="value">${property.purchasePrice.toLocaleString()}</span>
          </div>
          
          <div className="grid-item">
            <Square className="icon-xs" />
            <span className="label">Size</span>
            <span className="value">{property.squareMeters}m²</span>
          </div>
          
          <div className="grid-item highlight-income">
            <TrendingUp className="icon-xs" />
            <span className="label">Income</span>
            <span className="value">${property.financials.monthlyIncome.toLocaleString()}</span>
          </div>
          
          <div className="grid-item highlight-expense">
            <Receipt className="icon-xs" />
            <span className="label">Expenses</span>
            <span className="value">${property.financials.monthlyExpenses.toLocaleString()}</span>
          </div>
          
          <div className="grid-item highlight-yield">
            <Percent className="icon-xs" />
            <span className="label">Yield</span>
            <span className="value">{property.financials.yield}%</span>
          </div>
          
          {property.maintenance.urgentIssues > 0 && (
            <div className="grid-item highlight-warning">
              <AlertTriangle className="icon-xs" />
              <span className="label">Issues</span>
              <span className="value">{property.maintenance.urgentIssues}</span>
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
};

const EnhancedPropertyMap: React.FC<EnhancedPropertyMapProps> = ({ properties, totalYield }) => {
  const mapRef = React.useRef<L.Map>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const center: L.LatLngExpression = properties.length > 0 
    ? [properties[0].lat, properties[0].lng]
    : [55.6761, 12.5683];

  React.useEffect(() => {
    if (mapRef.current && properties.length > 0) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(
        properties.map(prop => [prop.lat, prop.lng])
      );
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  }, [properties]);

  return (
    <div className="map-container" ref={containerRef}>
      <PortfolioHeader properties={properties} totalYield={totalYield} />
      
      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {properties.map((property) => (
            <Marker key={property.id} position={[property.lat, property.lng]}>
              <SmartPopup property={property} />
            </Marker>
          ))}

          {/* Convert style tag to regular style object */}
          <style>
            {`
              .compact-popup .leaflet-popup-content-wrapper {
                border-radius: 6px;
                padding: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              }
              
              .compact-popup .leaflet-popup-tip {
                width: 12px;
                height: 12px;
              }
              
              .popup-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
              }
              
              .popup-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                flex-wrap: wrap;
              }
              
              .popup-title {
                font-weight: 600;
                margin: 0;
                font-size: 14px;
                flex: 1;
                min-width: 120px;
              }
              
              .status-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                background: #f0f0f0;
              }
              
              .status-badge.active {
                background: #e6f7ee;
                color: #0d9b5b;
              }
              
              .status-badge.vacant {
                background: #fff2e6;
                color: #e67e22;
              }
              
              .popup-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 6px;
              }
              
              .grid-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px;
                border-radius: 4px;
              }
              
              .label {
                color: #666;
                flex: 1;
              }
              
              .value {
                font-weight: 500;
                min-width: 60px;
                text-align: right;
              }
              
              .highlight-income { background-color: #f0fdf4; }
              .highlight-expense { background-color: #fef2f2; }
              .highlight-yield { background-color: #f5f3ff; }
              .highlight-warning { background-color: #fffbeb; }
              
              .icon-sm { width: 16px; height: 16px; }
              .icon-xs { width: 14px; height: 14px; }
            `}
          </style>
        </MapContainer>
      </div>

      {/* Converted to regular style tag */}
      <style>
        {`
          .map-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 20px);
            max-height: 1200px;
            min-height: 500px;
            padding: 10px;
            box-sizing: border-box;
          }
          
          .portfolio-header {
            padding: 12px 16px;
            background: #ffffff;
            border-radius: 8px 8px 0 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 4px;
            z-index: 1000;
          }
          
          .portfolio-title {
            font-size: 1.5rem;
            margin: 0 0 8px 0;
            color: #2d3748;
            font-weight: 600;
          }
          
          .portfolio-stats {
            display: flex;
            gap: 20px;
            font-size: 1rem;
            color: #4a5568;
          }
          
          .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .stat-item strong {
            font-weight: 500;
            color: #2d3748;
          }
          
          .map-wrapper {
            flex: 1;
            border-radius: 0 0 8px 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background: white;
          }
        `}
      </style>
    </div>
  );
};

export default EnhancedPropertyMap;