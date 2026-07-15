import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setChecking(false);
    };
    checkAdmin();
  }, [user]);

  if (loading || checking) {
    return <div className="flex justify-center items-center h-screen bg-[#1a1a1a] text-white">Cargando...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;