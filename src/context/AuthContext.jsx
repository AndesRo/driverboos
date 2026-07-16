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

      if (error) {
        console.error('Error al cargar suscripción:', error);
        setSuscripcion(null);
        setIsSubscriptionActive(false);
        setSubscriptionLoading(false);
        return;
      }

      if (!data) {
        // No existe suscripción (caso extremo): creamos una por defecto con estado 'vencida'
        // Esto no debería ocurrir si el trigger funciona correctamente.
        const { data: newSub, error: insertError } = await supabase
          .from('suscripciones')
          .insert({ user_id: userId, estado: 'vencida', tipo: 'vencida', fecha_inicio: new Date().toISOString().split('T')[0], fecha_vencimiento: new Date().toISOString().split('T')[0] })
          .select()
          .single();
        if (!insertError) {
          setSuscripcion(newSub);
          setIsSubscriptionActive(false);
        } else {
          console.error('No se pudo crear suscripción:', insertError);
          setSuscripcion(null);
          setIsSubscriptionActive(false);
        }
        setSubscriptionLoading(false);
        return;
      }

      // Verificar si la suscripción ha expirado y actualizar si es necesario
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : null;
      let estadoActual = data.estado;

      if (vencimiento) {
        vencimiento.setHours(0, 0, 0, 0);
        // Si la fecha de vencimiento es menor a hoy y el estado es 'activa' o 'prueba', actualizar a 'vencida'
        if (vencimiento < hoy && (estadoActual === 'activa' || estadoActual === 'prueba')) {
          console.log(`Suscripción expirada. Actualizando a vencida.`);
          const { error: updateError } = await supabase
            .from('suscripciones')
            .update({ estado: 'vencida' })
            .eq('id', data.id);
          if (!updateError) {
            estadoActual = 'vencida';
            data.estado = 'vencida';
          } else {
            console.error('Error al actualizar suscripción a vencida:', updateError);
          }
        }
      }

      setSuscripcion(data);

      // Determinar si la suscripción está activa: estado 'activa' o 'prueba' y fecha de vencimiento válida
      const activa = (estadoActual === 'activa' || estadoActual === 'prueba') && vencimiento && vencimiento >= hoy;
      setIsSubscriptionActive(activa);
      console.log(`Suscripción: ${activa ? 'ACTIVA' : 'INACTIVA'} (estado: ${estadoActual}, vencimiento: ${data.fecha_vencimiento})`);
    } catch (error) {
      console.error('Error inesperado en loadSubscription:', error);
      setSuscripcion(null);
      setIsSubscriptionActive(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
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
        console.error('Error al obtener sesión:', err);
        if (mounted) {
          setUser(null);
          setLoading(false);
          setSubscriptionLoading(false);
        }
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
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
      }
    });

    return () => {
      mounted = false;
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
        data: metadata
      }
    });
    if (error) throw error;
    // No creamos suscripción aquí; confiamos en el trigger de la base de datos.
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