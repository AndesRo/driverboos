// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'andespart@yahoo.com'; // Cambia por tu correo

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [suscripcionValida, setSuscripcionValida] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verificarSuscripcion = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      // Si es administrador, siempre válido sin consultar BD
      if (user.email === ADMIN_EMAIL) {
        setSuscripcionValida(true);
        setChecking(false);
        return;
      }

      // Para otros usuarios, consultar suscripción
      const { data, error } = await supabase
        .from('suscripciones')
        .select('estado')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data || data.estado !== 'activa') {
        setSuscripcionValida(false);
      } else {
        setSuscripcionValida(true);
      }
      setChecking(false);
    };

    verificarSuscripcion();
  }, [user]);

  if (loading || checking) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!suscripcionValida && user.email !== ADMIN_EMAIL) {
    return <Navigate to="/suscripcion-vencida" replace />;
  }

  return children;
};

export default ProtectedRoute;