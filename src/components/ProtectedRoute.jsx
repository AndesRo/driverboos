import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [suscripcion, setSuscripcion] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      // 1. Verificar si es administrador
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const admin = !!adminData;
      setIsAdmin(admin);

      // Si es administrador, permitir acceso sin verificar suscripción
      if (admin) {
        setChecking(false);
        return;
      }

      // 2. Si no es admin, verificar suscripción
      const { data, error } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error al obtener suscripción:', error);
        setChecking(false);
        return;
      }

      if (data) {
        const hoy = new Date();
        const vencimiento = new Date(data.fecha_vencimiento);
        // Actualizar automáticamente a vencida si expiró
        if (vencimiento < hoy && (data.estado === 'prueba' || data.estado === 'activa')) {
          await supabase
            .from('suscripciones')
            .update({ estado: 'vencida' })
            .eq('id', data.id);
          data.estado = 'vencida';
        }
        setSuscripcion(data);
      } else {
        setSuscripcion(null);
      }
      setChecking(false);
    };

    checkAccess();
  }, [user]);

  if (loading || checking) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si es administrador, permitir acceso total
  if (isAdmin) {
    return children;
  }

  // Si no es admin, validar suscripción
  if (!suscripcion || suscripcion.estado === 'vencida' || suscripcion.estado === 'suspendida') {
    return <Navigate to="/subscription-blocked" replace />;
  }

  // Si la suscripción está activa o en prueba, permitir acceso
  if (suscripcion.estado === 'prueba' || suscripcion.estado === 'activa') {
    return children;
  }

  // Fallback
  return <Navigate to="/subscription-blocked" replace />;
};

export default ProtectedRoute;