import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavigationProvider } from '../context/NavigationContext';
import PropertyListPage from '../pages/PropertyListPage';

const PropertyListPageWrapper = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <NavigationProvider>
      <PropertyListPage />
    </NavigationProvider>
  );
};

export default PropertyListPageWrapper;