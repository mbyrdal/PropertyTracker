import { useState, useEffect } from 'react';
import PropertyMap from './components/PropertyMap';
import type { Property } from './types/property';
import './index.css'; // Make sure this import exists

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('https://localhost:7188/api/property');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <h1>Property Map</h1>
      <div className="map-container">
        <PropertyMap properties={properties} />
      </div>
    </div>
  );
}

export default App;