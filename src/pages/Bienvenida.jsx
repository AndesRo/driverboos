import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Bienvenida = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Esperar a que la sesión esté cargada
  useEffect(() => {
    if (!loading && !user) {
      // Si no hay usuario después de cargar, redirige al login
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user, navigate]);

  // Obtener nombre del usuario desde metadata
  const nombre = user?.user_metadata?.nombre || user?.email || 'Usuario';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <p className="text-white text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirige al login en el useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1a1a1a]">
      <div className="card w-full max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-primary">
          ¡Bienvenido, {nombre}!
        </h1>
        <p className="text-gray-300">
          Tu cuenta ha sido activada exitosamente. Disfruta de{' '}
          <span className="font-bold text-primary">7 días de prueba</span> en{' '}
          <span className="font-semibold text-white">DriverBoos</span>.
        </p>
        <p className="text-green-400">
          Redirigiendo al inicio en{' '}
          <span className="font-bold">{countdown}</span> segundos...
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary w-full text-center py-3"
        >
          Ir al inicio ahora
        </button>
        <p className="text-gray-500 text-sm">
          Si no eres redirigido automáticamente, haz clic en el botón.
        </p>
      </div>
    </div>
  );
};

export default Bienvenida;