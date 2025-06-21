import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Home, Landmark, Receipt, TrendingUp, Percent, BadgeInfo, Square, MapPin, List 
} from "lucide-react";
import type { EnhancedProperty } from "../types/property";
import { useNavigation } from "../context/NavigationContext";
import "./EnhancedPropertyMap.css";

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

const StatusLegend = () => (
  <div className="map-legend">
    <h4>Ejendomsstatus</h4>
    <div className="legend-item">
      <span className="legend-color active"></span>
      <span>Aktiv (God)</span>
    </div>
    <div className="legend-item">
      <span className="legend-color active-issues"></span>
      <span>Aktiv (Vedligehold anmodet)</span>
    </div>
    <div className="legend-item">
      <span className="legend-color vacant"></span>
      <span>Ledig</span>
    </div>
    <div className="legend-item">
      <span className="legend-color vacant-issues"></span>
      <span>Ledig (Istandsættelse nødvendig)</span>
    </div>
  </div>
);

const getMarkerColor = (property: EnhancedProperty) => {
  if (property.status.toLowerCase() === 'vacant') {
    return property.maintenance.urgentIssues > 0 ? '#c62828' : '#e74c3c';
  }
  if (property.maintenance.urgentIssues > 0) return '#e67e22';
  return '#2ecc71';
};

const createMarkerIcon = (property: EnhancedProperty, isHovered: boolean) => {
  const color = getMarkerColor(property);
  return L.divIcon({
    className: `property-marker ${isHovered ? 'hovered' : ''}`,
    html: `
      <div class="marker-pin" style="background: ${color}">
        ${property.maintenance.urgentIssues > 0 ? 
          `<span class="issue-count">${property.maintenance.urgentIssues}</span>` : ''}
      </div>
    `,
    iconSize: isHovered ? [36, 50] : [30, 42],
    iconAnchor: isHovered ? [18, 50] : [15, 42]
  });
};

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
          <h1 className="portfolio-title">Ejendomsportefølje</h1>
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
              Kortvisning
            </button>
            <button 
              onClick={() => setCurrentView('list')}
              className={`nav-link ${currentView === 'list' ? 'active' : ''}`}
            >
              <List className="icon-sm" />
              Ejendomsliste
            </button>
          </nav>
        </div>
        
        <div className="portfolio-stats">
          <div className="stat-card">
            <span className="stat-label">Antal ejendomme</span>
            <span className="stat-value">{totalProperties}</span>
          </div>
          <div className="stat-card highlight-value">
            <span className="stat-label">Porteføljeværdi</span>
            <span className="stat-value">{(totalValue / 1000000).toLocaleString('da-DK', {maximumFractionDigits: 1})} mio. kr.</span>
          </div>
          <div className="stat-card highlight-yield">
            <span className="stat-label">Gns. afkast</span>
            <span className="stat-value">{avgYield.toLocaleString('da-DK', {maximumFractionDigits: 1})}%</span>
          </div>
          <div className="stat-card highlight-cashflow">
            <span className="stat-label">Månedlig cash flow</span>
            <span className="stat-value">{totalCashFlow.toLocaleString('da-DK')} kr.</span>
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

  const getMaintenanceStatus = () => {
    if (property.maintenance.urgentIssues === 0) return null;
    
    return property.status === 'Active'
      ? {
          type: 'tenant',
          text: `${property.maintenance.urgentIssues} lejeranmodning(er)`,
          description: 'Lejer har anmodet om istandsættelse',
          icon: '🛠️'
        }
      : {
          type: 'property',
          text: `${property.maintenance.urgentIssues} istandsættelse(r)`,
          description: 'Kræver istandsættelse før udlejning',
          icon: '🏗️'
        };
  };

  const maintenanceStatus = getMaintenanceStatus();

  return (
    <Popup ref={popupRef} className="compact-popup">
      <div className="popup-content">
        <div className="popup-header">
          <Home className="icon-sm text-blue-600" />
          <h3 className="popup-title">{property.name}</h3>
          <div className={`status-badge ${property.status.toLowerCase()} ${maintenanceStatus?.type || ''}`}>
            <BadgeInfo className="icon-xs" />
            <span>
              {property.status === 'Active' ? 'Aktiv' : 'Ledig'}
              {maintenanceStatus && (
                <span className="badge-count"> • {maintenanceStatus.text}</span>
              )}
            </span>
          </div>
        </div>
        
        <div className="popup-grid">
          <div className="grid-item">
            <Landmark className="icon-xs" />
            <span className="label">Pris</span>
            <span className="value">{property.purchasePrice.toLocaleString('da-DK')} kr.</span>
          </div>
          
          <div className="grid-item">
            <Square className="icon-xs" />
            <span className="label">Areal</span>
            <span className="value">{property.squareMeters}m²</span>
          </div>
          
          <div className="grid-item highlight-income">
            <TrendingUp className="icon-xs" />
            <span className="label">Indtægt</span>
            <span className="value">{property.financials.monthlyIncome.toLocaleString('da-DK')} kr.</span>
          </div>
          
          <div className="grid-item highlight-expense">
            <Receipt className="icon-xs" />
            <span className="label">Udgifter</span>
            <span className="value">{property.financials.monthlyExpenses.toLocaleString('da-DK')} kr.</span>
          </div>
          
          <div className="grid-item highlight-yield">
            <Percent className="icon-xs" />
            <span className="label">Afkast</span>
            <span className="value">{property.financials.yield.toLocaleString('da-DK')}%</span>
          </div>
        </div>
        
        <div className="popup-status-help">
          <small className={maintenanceStatus?.type || ''}>
            {maintenanceStatus ? (
              <>{maintenanceStatus.icon} {maintenanceStatus.description}</>
            ) : property.status === 'Active' ? (
              '✓ Udlejet uden problemer'
            ) : (
              '⚠️ Ingen aktive lejere'
            )}
          </small>
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
            attribution='&copy; OpenStreetMap bidragydere'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {properties.map((property) => {
            const [isHovered, setIsHovered] = useState(false);
            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                icon={createMarkerIcon(property, isHovered)}
                eventHandlers={{
                  mouseover: () => setIsHovered(true),
                  mouseout: () => setIsHovered(false)
                }}
              >
                <SmartPopup property={property} />
              </Marker>
            );
          })}

          <StatusLegend />
        </MapContainer>
      </div>
    </div>
  );
};

export default EnhancedPropertyMap;