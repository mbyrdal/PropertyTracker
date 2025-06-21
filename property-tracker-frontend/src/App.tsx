import { useState, useEffect } from 'react';
import EnhancedPropertyMap from './components/EnhancedPropertyMap';
import type { EnhancedProperty } from './components/EnhancedPropertyMap';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Simplified API property type (matches your actual API response)
interface ApiProperty {
  id: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

// Transform API properties to EnhancedProperty (without photos)
const transformProperties = (apiProperties: ApiProperty[]): EnhancedProperty[] => {
  return apiProperties.map(apiProp => {
    // Generate realistic dates
    const now = new Date();
    const lastServiceDate = new Date(now);
    lastServiceDate.setMonth(now.getMonth() - 3);
    
    return {
      id: apiProp.id,
      address: apiProp.address,
      status: 'Active',
      lat: apiProp.latitude || 0,
      lng: apiProp.longitude || 0,
      financials: {
        monthlyIncome: Math.floor(Math.random() * 5000) + 1000,
        monthlyExpenses: Math.floor(Math.random() * 2000) + 500,
        cashFlow: 0, // Will be calculated below
        yield: parseFloat((Math.random() * 10 + 2).toFixed(1))
      },
      maintenance: {
        lastService: lastServiceDate.toISOString().split('T')[0],
        nextScheduled: new Date(now.setMonth(now.getMonth() + 3)).toISOString().split('T')[0],
        urgentIssues: Math.floor(Math.random() * 3)
      },
      photos: [] // Empty array ensures no images are shown
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
        const enhancedData = transformProperties(apiData);
        
        // Filter out properties with invalid coordinates
        const validProperties = enhancedData.filter(p => p.lat !== 0 && p.lng !== 0);
        
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <h1>Property Map</h1>
      <div className="map-container">
        <EnhancedPropertyMap properties={properties} />
      </div>
    </div>
  );
}

export default App;