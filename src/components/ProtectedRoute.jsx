import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isSubscriptionActive, subscriptionLoading } = useAuth();

  if (loading || subscriptionLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSubscriptionActive) {
    return <Navigate to="/subscription-blocked" replace />;
  }

  return children;
};

export default ProtectedRoute;