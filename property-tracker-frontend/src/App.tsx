import { useState, useEffect } from 'react';
import PropertyMap from './components/PropertyMap';
import type { Property } from './types/property'; // Added 'type' keyword

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/property');
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <div className="p-4">Loading map...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (properties.length === 0) return <div className="p-4">No properties found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Property Map</h1>
      <PropertyMap properties={properties} />
    </div>
  );
}

export default App;