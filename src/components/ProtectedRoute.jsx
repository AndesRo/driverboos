import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isSubscriptionActive, subscriptionLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsAdmin(!!data);
      setCheckingAdmin(false);
    };
    checkAdmin();
  }, [user]);

  if (loading || subscriptionLoading || checkingAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si es administrador, permitir acceso a cualquier ruta
  if (isAdmin) {
    return children;
  }

  // Si no es admin y la suscripción no está activa, bloquear
  if (!isSubscriptionActive) {
    return <Navigate to="/subscription-blocked" replace />;
  }

  return children;
};

export default ProtectedRoute;