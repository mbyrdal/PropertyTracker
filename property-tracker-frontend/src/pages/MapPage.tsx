import { useEffect, useState } from 'react';
import EnhancedPropertyMap from '../components/EnhancedPropertyMap'; 
import type { EnhancedProperty } from '../types/property'; // Changed import

export default function MapPage() {
  const [properties, setProperties] = useState<EnhancedProperty[]>([]); // Updated type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/property');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data: EnhancedProperty[] = await response.json(); // Updated type
        setProperties(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
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
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Properties</h2>
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

  return <EnhancedPropertyMap properties={properties} />;
}