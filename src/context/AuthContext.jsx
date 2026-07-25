import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suscripcion, setSuscripcion] = useState(null);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const mountedRef = useRef(true);

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const loadSubscription = async (userId) => {
    if (!userId) {
      if (mountedRef.current) {
        setSuscripcion(null);
        setIsSubscriptionActive(false);
        setSubscriptionLoading(false);
      }
      return;
    }

    if (mountedRef.current) setSubscriptionLoading(true);

    try {
      const { data, error } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (error) {
        console.error('Error al cargar suscripción:', error);
        setSuscripcion(null);
        setIsSubscriptionActive(false);
        setSubscriptionLoading(false);
        return;
      }

      if (!data) {
        console.error(
          `[Auth] Usuario ${userId} no tiene fila en 'suscripciones'. ` +
          `Revisar el trigger de creación de suscripción en la BD.`
        );
        setSuscripcion(null);
        setIsSubscriptionActive(false);
        setSubscriptionLoading(false);
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = parseLocalDate(data.fecha_vencimiento);
      const estadoActual = data.estado;

      if (!mountedRef.current) return;

      setSuscripcion(data);

      const activa =
        (estadoActual === 'activa' || estadoActual === 'prueba') &&
        vencimiento && vencimiento >= hoy;
      setIsSubscriptionActive(activa);

      console.log(
        `Suscripción: ${activa ? 'ACTIVA' : 'INACTIVA'} ` +
        `(estado: ${estadoActual}, vencimiento: ${data.fecha_vencimiento})`
      );
    } catch (err) {
      console.error('Error inesperado en loadSubscription:', err);
      if (mountedRef.current) {
        setSuscripcion(null);
        setIsSubscriptionActive(false);
      }
    } finally {
      if (mountedRef.current) setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // === NUEVO: Obtener sesión inicial ===
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mountedRef.current) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          setLoading(false);
          if (currentUser) {
            await loadSubscription(currentUser.id);
          } else {
            setSubscriptionLoading(false);
          }
        }
      } catch (err) {
        console.error('Error al obtener sesión inicial:', err);
        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
          setSubscriptionLoading(false);
        }
      }
    };

    getInitialSession();

    // === Listener para cambios posteriores ===
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        if (event === 'TOKEN_REFRESHED') return;
        await loadSubscription(currentUser.id);
      } else {
        setSuscripcion(null);
        setIsSubscriptionActive(false);
        setSubscriptionLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      listener?.subscription?.unsubscribe();
    };
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

  const register = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        redirectTo: window.location.origin + '/bienvenida', // ✅ redirección a bienvenida
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSuscripcion(null);
    setIsSubscriptionActive(false);
  };

  const value = {
    user,
    loading,
    suscripcion,
    isSubscriptionActive,
    subscriptionLoading,
    refreshSubscription,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);