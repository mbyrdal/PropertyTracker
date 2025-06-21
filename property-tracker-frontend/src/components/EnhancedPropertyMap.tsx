import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { PopupEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Home, Landmark, Receipt, TrendingUp, Percent, CalendarCheck, CalendarClock, AlertTriangle, Wrench, CircleDollarSign, BadgeInfo } from "lucide-react";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export interface EnhancedProperty {
  id: string;
  address: string;
  status: string;
  lat: number;
  lng: number;
  financials: {
    monthlyIncome: number;
    monthlyExpenses: number;
    cashFlow: number;
    yield: number;
  };
  maintenance: {
    lastService: string;
    nextScheduled?: string;
    urgentIssues: number;
  };
}

interface EnhancedPropertyMapProps {
  properties: EnhancedProperty[];
}

const SmartPopup = ({ property }: { property: EnhancedProperty }) => {
  const popupRef = React.useRef<L.Popup>(null);

  React.useEffect(() => {
    if (popupRef.current) {
      const popup = popupRef.current;
      popup.options.autoPan = true;
      popup.options.autoPanPaddingTopLeft = L.point(20, 20);
      popup.options.autoPanPaddingBottomRight = L.point(20, 20);
      popup.options.maxWidth = 300;
      popup.options.minWidth = 250;
      popup.options.offset = L.point(0, -25);
    }
  }, []);

  return (
    <Popup ref={popupRef} className="enhanced-popup">
      <div className="popup-container">
        <div className="popup-header">
          <Home className="icon-lg text-blue-600" />
          <h3 className="popup-title">{property.address}</h3>
        </div>
        
        <div className={`status-badge ${property.status.toLowerCase()}`}>
          <BadgeInfo className="icon-sm" />
          <span>{property.status}</span>
        </div>

        <div className="popup-section">
          <div className="section-header">
            <CircleDollarSign className="icon-md text-purple-600" />
            <span>Financials</span>
          </div>
          <div className="grid-section">
            <div className="data-row text-income">
              <Landmark className="icon-md" />
              <span>Income:</span>
              <span>${property.financials.monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="data-row text-expense">
              <Receipt className="icon-md" />
              <span>Expenses:</span>
              <span>${property.financials.monthlyExpenses.toLocaleString()}</span>
            </div>
            <div className="data-row text-cashflow">
              <TrendingUp className="icon-md" />
              <span>Cash Flow:</span>
              <span>${property.financials.cashFlow.toLocaleString()}</span>
            </div>
            <div className="data-row text-yield">
              <Percent className="icon-md" />
              <span>Yield:</span>
              <span>{property.financials.yield}%</span>
            </div>
          </div>
        </div>

        <div className="popup-section">
          <div className="section-header">
            <Wrench className="icon-md text-orange-600" />
            <span>Maintenance</span>
          </div>
          <div className="grid-section">
            <div className="data-row">
              <CalendarCheck className="icon-md text-gray-500" />
              <span>Last:</span>
              <span>{property.maintenance.lastService}</span>
            </div>
            <div className="data-row">
              <CalendarClock className="icon-md text-gray-500" />
              <span>Next:</span>
              <span>{property.maintenance.nextScheduled || "N/A"}</span>
            </div>
            <div className={`data-row ${property.maintenance.urgentIssues > 0 ? 'text-warning' : ''}`}>
              <AlertTriangle className="icon-md" />
              <span>Issues:</span>
              <span>{property.maintenance.urgentIssues}</span>
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

const EnhancedPropertyMap: React.FC<EnhancedPropertyMapProps> = ({ properties }) => {
  const mapRef = React.useRef<L.Map>(null);
  const markersRef = React.useRef<{[key: string]: L.Marker}>({});
  const [activePopup, setActivePopup] = React.useState<string | null>(null);
  const [hoveredMarker, setHoveredMarker] = React.useState<string | null>(null);

  const handleMarkerMouseOver = (e: L.LeafletMouseEvent) => {
    const marker = e.target as L.Marker;
    const propertyId = (marker.options as any).title as string;
    setHoveredMarker(propertyId);
    
    if (!activePopup) {
      marker.openPopup();
    }
  };

  const handleMarkerMouseOut = () => {
    if (!activePopup && hoveredMarker) {
      const marker = markersRef.current[hoveredMarker];
      if (marker) {
        marker.closePopup();
      }
    }
    setHoveredMarker(null);
  };

  const handleMarkerClick = (e: L.LeafletMouseEvent) => {
    const marker = e.target as L.Marker;
    const propertyId = (marker.options as any).title as string;
    
    if (activePopup === propertyId) {
      setActivePopup(null);
      marker.closePopup();
    } else {
      setActivePopup(propertyId);
      
      // Close all other popups
      Object.entries(markersRef.current).forEach(([id, m]) => {
        if (id !== propertyId) m.closePopup();
      });
      
      marker.openPopup();
    }
  };

  const handlePopupClose = (e: PopupEvent) => {
    const popup = e.popup as L.Popup;
    const marker = (popup as any)._source as L.Marker;
    
    if (marker) {
      const propertyId = (marker.options as any)?.title as string;
      if (activePopup === propertyId) {
        setActivePopup(null);
      }
      if (hoveredMarker === propertyId) {
        setHoveredMarker(null);
      }
    }
  };

  React.useEffect(() => {
    const markers = markersRef.current;
    
    // Add popupclose event listeners
    Object.values(markers).forEach(marker => {
      marker.on('popupclose', handlePopupClose);
    });

    return () => {
      // Clean up event listeners
      Object.values(markers).forEach(marker => {
        marker.off('popupclose', handlePopupClose);
      });
    };
  }, [activePopup, hoveredMarker]);

  return (
    <MapContainer
      center={[properties[0]?.lat ?? 40.7589, properties[0]?.lng ?? -73.9851]}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: "80vh", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {properties.map((p) => (
        <Marker 
          key={p.id} 
          position={[p.lat, p.lng]}
          title={p.id}
          eventHandlers={{
            click: handleMarkerClick,
            mouseover: handleMarkerMouseOver,
            mouseout: handleMarkerMouseOut
          }}
          ref={(ref) => {
            if (ref) {
              markersRef.current[p.id] = ref;
            }
          }}
        >
          <SmartPopup property={p} />
        </Marker>
      ))}

      <style>
        {`
          .leaflet-popup {
            pointer-events: none;
            margin-bottom: 20px !important;
          }
          .leaflet-popup-content-wrapper {
            pointer-events: auto;
          }
          .leaflet-marker-icon {
            z-index: 600;
          }
          .leaflet-popup-pane {
            z-index: 500;
          }
          .enhanced-popup {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .popup-container {
            padding: 8px;
          }
          .popup-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }
          .popup-title {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-bottom: 12px;
          }
          .status-badge.active {
            background-color: #e6f7ee;
            color: #10b981;
          }
          .status-badge.pending {
            background-color: #fff4e6;
            color: #f59e0b;
          }
          .status-badge.inactive {
            background-color: #f3e8ff;
            color: #8b5cf6;
          }
          .popup-section {
            margin-bottom: 12px;
          }
          .section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .grid-section {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 8px;
            font-size: 14px;
          }
          .data-row {
            display: contents;
          }
          .data-row > * {
            display: flex;
            align-items: center;
          }
          .text-income {
            color: #10b981;
          }
          .text-expense {
            color: #ef4444;
          }
          .text-cashflow {
            color: #3b82f6;
          }
          .text-yield {
            color: #8b5cf6;
          }
          .text-warning {
            color: #f59e0b;
          }
          .icon-sm {
            width: 14px;
            height: 14px;
          }
          .icon-md {
            width: 16px;
            height: 16px;
          }
          .icon-lg {
            width: 18px;
            height: 18px;
          }
        `}
      </style>
    </MapContainer>
  );
};

export default EnhancedPropertyMap;