import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Home, Landmark, Receipt, TrendingUp, Percent, 
  AlertTriangle, BadgeInfo, Square, MapPin, List 
} from "lucide-react";
import type { EnhancedProperty } from "../types/property";
import { useNavigation } from "../context/NavigationContext";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EnhancedPropertyMapProps {
  properties: EnhancedProperty[];
}

const PortfolioHeader = ({ properties }: { properties: EnhancedProperty[] }) => {
  const { currentView, setCurrentView } = useNavigation();
  
  const totalProperties = properties.length;
  const totalValue = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
  const avgYield = properties.length > 0 
    ? properties.reduce((sum, p) => sum + p.financials.yield, 0) / properties.length
    : 0;
  const totalMonthlyIncome = properties.reduce((sum, p) => sum + p.financials.monthlyIncome, 0);
  const totalMonthlyExpenses = properties.reduce((sum, p) => sum + p.financials.monthlyExpenses, 0);
  const totalCashFlow = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <div className="portfolio-header">
      <div className="header-content">
        <div className="header-main">
          <h1 className="portfolio-title">Property Portfolio</h1>
          <nav className="nav-links">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              <Home className="icon-sm" />
              Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('map')}
              className={`nav-link ${currentView === 'map' ? 'active' : ''}`}
            >
              <MapPin className="icon-sm" />
              Map View
            </button>
            <button 
              onClick={() => setCurrentView('list')}
              className={`nav-link ${currentView === 'list' ? 'active' : ''}`}
            >
              <List className="icon-sm" />
              Property List
            </button>
          </nav>
        </div>
        
        <div className="portfolio-stats">
          <div className="stat-card">
            <span className="stat-label">Total Properties</span>
            <span className="stat-value">{totalProperties}</span>
          </div>
          <div className="stat-card highlight-value">
            <span className="stat-label">Portfolio Value</span>
            <span className="stat-value">${(totalValue / 1000000).toFixed(1)}M</span>
          </div>
          {/* FIX: improved contrast for Avg Yield card */}
          <div className="stat-card highlight-yield">
            <span className="stat-label">Avg Yield</span>
            <span className="stat-value">{avgYield.toFixed(1)}%</span>
          </div>
          <div className="stat-card highlight-cashflow">
            <span className="stat-label">Monthly Cash Flow</span>
            <span className="stat-value">${totalCashFlow.toLocaleString()}</span>
          </div>
        </div>
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

const EnhancedPropertyMap: React.FC<EnhancedPropertyMapProps> = ({ properties }) => {
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
      <PortfolioHeader properties={properties} />
      
      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ 
            height: "100%", 
            width: "100%",
            minHeight: "calc(100vh - 180px)"
          }}
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

          <style>
            {`
              .portfolio-header {
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                color: white;
                padding: 1rem 1.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                position: relative;
                z-index: 1000;
              }

              .map-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                padding-bottom: 16px;
              }

              .map-wrapper {
                flex: 1;
                position: relative;
                height: calc(100% - 120px);
                padding: 0 16px;
              }

              .leaflet-container {
                height: 100% !important;
                width: 100% !important;
                border-radius: 8px;
              }

              .header-content {
                max-width: 1200px;
                margin: 0 auto;
                width: 100%;
              }

              .header-main {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                flex-wrap: wrap;
                gap: 1rem;
              }

              .portfolio-title {
                font-size: 1.75rem;
                margin: 0;
                font-weight: 600;
                color: white;
              }

              .nav-links {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
              }

              .nav-link {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                transition: all 0.2s;
                background: none;
                border: none;
                cursor: pointer;
                font-family: inherit;
                font-size: 0.95rem;
              }

              .nav-link:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
              }

              .nav-link.active {
                background: rgba(255, 255, 255, 0.2);
                color: white;
              }

              .portfolio-stats {
                display: flex;
                gap: 1rem;
                overflow-x: auto;
                padding-bottom: 0.5rem;
              }

              .stat-card {
                background: rgba(59, 130, 246, 0.2);
                border-radius: 8px;
                padding: 0.75rem 1rem;
                min-width: 160px;
                flex: 1;
              }

              .stat-label {
                font-size: 0.875rem;
                color: rgba(255, 255, 255, 0.8);
                display: block;
                margin-bottom: 0.25rem;
              }

              .stat-value {
                font-size: 1.25rem;
                font-weight: 600;
                color: white;
                display: block;
              }

              /* Border colors only - no background overrides */
              .highlight-value {
                border-left: 3px solid #10b981;
              }

              /* UPDATED: better contrast for Avg Yield card */
              .highlight-yield {
                border-left: 3px solid #8b5cf6;
                background: rgba(59, 130, 246, 0.2);
              }

              .highlight-yield .stat-label,
              .highlight-yield .stat-value {
                color: white;
              }

              .highlight-cashflow {
                border-left: 3px solid #3b82f6;
              }

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
              .highlight-warning { background-color: #fffbeb; }
              
              .icon-sm { width: 16px; height: 16px; }
              .icon-xs { width: 14px; height: 14px; }
            `}
          </style>
        </MapContainer>
      </div>
    </div>
  );
};

export default EnhancedPropertyMap;