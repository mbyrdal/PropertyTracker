import { useEffect, useState } from 'react';
import PropertyMap from '../components/PropertyMap';
import type { Property } from '../types/property'; // Changed to type-only import

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/property');
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <div className="p-4">Loading properties...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Property Map</h1>
      <PropertyMap properties={properties} />
    </div>
  );
}