import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import EnhancedPropertyMap from '../components/EnhancedPropertyMap';
import { useAuth } from '../context/AuthContext';
import { NavigationProvider } from '../context/NavigationContext';
import type { EnhancedProperty } from '../types/property';

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
    const purchaseDate = new Date(apiProp.purchaseDate);
    const lastServiceDate = new Date(purchaseDate);
    lastServiceDate.setMonth(purchaseDate.getMonth() + Math.floor(Math.random() * 12));
    const nextServiceDate = new Date(lastServiceDate);
    nextServiceDate.setMonth(lastServiceDate.getMonth() + 6);
    const annualRent = apiProp.totalMonthlyRent * 12;
    const yieldValue = (annualRent / apiProp.purchasePrice) * 100;

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
        cashFlow: 0,
        yield: parseFloat(yieldValue.toFixed(1))
      },
      maintenance: {
        lastService: lastServiceDate.toISOString().split('T')[0],
        nextScheduled: nextServiceDate.toISOString().split('T')[0],
        urgentIssues: Math.floor(Math.random() * 3)
      },
      photos: []
    };
  }).map(p => ({
    ...p,
    financials: {
      ...p.financials,
      cashFlow: p.financials.monthlyIncome - p.financials.monthlyExpenses
    }
  }));
};

const PropertyMapWrapper = () => {
  const [properties, setProperties] = useState<EnhancedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:5000/api/property', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const apiData: ApiProperty[] = await response.json();
        const enhancedData = transformProperties(apiData);
        const validProperties = enhancedData.filter(p =>
          !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0
        );
        setProperties(validProperties);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (loading) return <div className="loading"><div className="spinner" /><p>Loading property data...</p></div>;
  if (error) return <div className="error"><h2>Error</h2><p>{error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <NavigationProvider>
      <div className="app" style={{ height: '100%', width: '100%' }}>
        <EnhancedPropertyMap properties={properties} />
      </div>
    </NavigationProvider>
  );
};

export default PropertyMapWrapper;