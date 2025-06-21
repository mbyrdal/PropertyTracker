import { useState, useEffect } from 'react';
import EnhancedPropertyMap from './components/EnhancedPropertyMap';
import type { EnhancedProperty } from './types/property';  // Correct import path
import 'leaflet/dist/leaflet.css';
import './index.css';

// Your existing ApiProperty interface remains the same
interface ApiProperty {
  id: number;
  name: string;
  address: string;
  purchasePrice: number;
  purchaseDate: string;
  squareMeters: number;
  latitude: number;
  longitude: number;
  tenantCount: number;
  totalMonthlyRent: number;
}

const transformProperties = (apiProperties: ApiProperty[]): EnhancedProperty[] => {
  return apiProperties.map(apiProp => {
    // Calculate years owned
    const purchaseDate = new Date(apiProp.purchaseDate);
    
    // Generate maintenance dates based on purchase date
    const lastServiceDate = new Date(purchaseDate);
    lastServiceDate.setMonth(purchaseDate.getMonth() + Math.floor(Math.random() * 12));
    
    const nextServiceDate = new Date(lastServiceDate);
    nextServiceDate.setMonth(lastServiceDate.getMonth() + 6);
    
    // Calculate yield based on actual purchase price and rent
    const annualRent = apiProp.totalMonthlyRent * 12;
    const yieldValue = annualRent / apiProp.purchasePrice * 100;
    
    return {
      id: apiProp.id.toString(),
      name: apiProp.name,
      address: apiProp.address,
      status: 'Active',
      lat: apiProp.latitude,
      lng: apiProp.longitude,
      purchasePrice: apiProp.purchasePrice,
      purchaseDate: apiProp.purchaseDate.split('T')[0],
      squareMeters: apiProp.squareMeters,
      tenantCount: apiProp.tenantCount,
      financials: {
        monthlyIncome: apiProp.totalMonthlyRent,
        monthlyExpenses: Math.floor(apiProp.totalMonthlyRent * 0.3),
        cashFlow: 0, // Will be calculated below
        yield: parseFloat(yieldValue.toFixed(1))
      },
      maintenance: {
        lastService: lastServiceDate.toISOString().split('T')[0],
        nextScheduled: nextServiceDate.toISOString().split('T')[0],
        urgentIssues: Math.floor(Math.random() * 3) // Add this required field
      },
      photos: [] // Initialize empty array for photos
    };
  }).map(p => ({
    ...p,
    financials: {
      ...p.financials,
      cashFlow: p.financials.monthlyIncome - p.financials.monthlyExpenses
    }
  }));
};

function App() {
  const [properties, setProperties] = useState<EnhancedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('https://localhost:7188/api/property');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const apiData: ApiProperty[] = await response.json();
        
        if (!Array.isArray(apiData)) {
          throw new Error('Invalid data format received from API');
        }
        
        const enhancedData = transformProperties(apiData);
        
        // Filter out properties with invalid coordinates
        const validProperties = enhancedData.filter(p => 
          !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0
        );
        
        if (validProperties.length === 0) {
          console.warn('No properties with valid coordinates found');
        }
        
        setProperties(validProperties);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading property data...</p>
    </div>
  );
  
  if (error) return (
    <div className="error">
      <h2>Error Loading Data</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="app">
      <div className="map-container">
        <EnhancedPropertyMap properties={properties} />
      </div>
    </div>
  );
}

export default App;