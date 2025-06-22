import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';
import PropertyMapWrapper from './wrappers/PropertyMapWrapper';
import PropertyListPageWrapper from './wrappers/PropertyListPageWrapper';

function LoginWrapper() {
  return <Login />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/" element={<PropertyMapWrapper />} />
          <Route path="/map" element={<PropertyMapWrapper />} />
          <Route path="/properties" element={<PropertyListPageWrapper />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;