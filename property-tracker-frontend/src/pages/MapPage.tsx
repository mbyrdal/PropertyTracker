import { useEffect, useState } from 'react';
import EnhancedPropertyMap from '../components/EnhancedPropertyMap';
import type { EnhancedProperty } from '../types/property';

export default function MapPage() {
  const [properties, setProperties] = useState<EnhancedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/property');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();
        
        // Transform API data to match our frontend structure
        const transformedData = apiData.map((property: any) => ({
          id: property.id.toString(),
          name: property.name,
          address: property.address,
          status: 'Active',
          lat: property.latitude,
          lng: property.longitude,
          purchasePrice: property.purchasePrice,
          purchaseDate: property.purchaseDate,
          squareMeters: property.squareMeters,
          tenantCount: property.tenantCount,
          financials: {
            monthlyIncome: property.totalMonthlyRent,
            monthlyExpenses: Math.round(property.totalMonthlyRent * 0.3), // 30% expense estimate
            cashFlow: property.totalMonthlyRent - Math.round(property.totalMonthlyRent * 0.3),
            yield: parseFloat(((property.totalMonthlyRent * 12 / property.purchasePrice) * 100).toFixed(1))
          },
          maintenance: {
            lastService: new Date(
              new Date(property.purchaseDate).setMonth(
                new Date(property.purchaseDate).getMonth() - 3
              )
            ).toISOString(),
            nextScheduled: new Date(
              new Date(property.purchaseDate).setMonth(
                new Date(property.purchaseDate).getMonth() + 3
              )
            ).toISOString(),
            urgentIssues: Math.min(property.tenantCount, 3) // Max 3 issues
          }
        }));

        setProperties(transformedData);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Henter ejendomme...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Fejl ved hentning af ejendomme</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <EnhancedPropertyMap properties={properties} />
    </div>
  );
}