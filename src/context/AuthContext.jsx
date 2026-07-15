import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suscripcion, setSuscripcion] = useState(null);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const loadSubscription = async (userId) => {
    if (!userId) {
      setSuscripcion(null);
      setIsSubscriptionActive(false);
      setSubscriptionLoading(false);
      return;
    }
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Si no existe, la creamos (por si el trigger falló)
      if (error && error.code === 'PGRST116') {
        const { data: newSub, error: insertError } = await supabase
          .from('suscripciones')
          .insert([{ user_id: userId, estado: 'vencida' }])
          .select()
          .single();
        if (!insertError) {
          setSuscripcion(newSub);
          setIsSubscriptionActive(false);
        } else {
          console.error('Error al crear suscripción:', insertError);
        }
        setSubscriptionLoading(false);
        return;
      }

      if (error) throw error;
      setSuscripcion(data);
      if (data && data.estado === 'activa' && data.fecha_vencimiento) {
        const hoy = new Date();
        const vencimiento = new Date(data.fecha_vencimiento);
        hoy.setHours(0,0,0,0);
        vencimiento.setHours(0,0,0,0);
        setIsSubscriptionActive(vencimiento >= hoy);
      } else {
        setIsSubscriptionActive(false);
      }
    } catch (error) {
      console.error('Error cargando suscripción:', error);
      setIsSubscriptionActive(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await loadSubscription(currentUser.id);
      } else {
        setSubscriptionLoading(false);
      }
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await loadSubscription(currentUser.id);
      } else {
        setSuscripcion(null);
        setIsSubscriptionActive(false);
        setSubscriptionLoading(false);
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription(user.id);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Crear suscripción manualmente
    if (data.user) {
      const { error: subError } = await supabase
        .from('suscripciones')
        .insert([{ user_id: data.user.id, estado: 'vencida' }]);
      if (subError) console.warn('Error al crear suscripción en registro:', subError);
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      suscripcion,
      isSubscriptionActive,
      subscriptionLoading,
      refreshSubscription,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);