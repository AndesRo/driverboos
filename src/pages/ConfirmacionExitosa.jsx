// src/pages/ConfirmacionExitosa.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ConfirmacionExitosa = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (authLoading) return; // Esperar a que la sesión esté lista
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
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <p className="text-white text-lg">Verificando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1a1a1a]">
      <div className="card w-full max-w-md text-center space-y-6">
        <div className="text-6xl">✅</div>
        <h1 className="text-3xl font-bold text-primary">¡Cuenta confirmada!</h1>
        <p className="text-gray-300">
          Tu correo electrónico ha sido verificado exitosamente. Ahora puedes comenzar a usar <span className="font-semibold text-white">Driver Control</span>.
        </p>

        {user ? (
          <>
            <p className="text-green-400">
              Redirigiendo al inicio en <span className="font-bold">{countdown}</span> segundos...
            </p>
            <Link to="/" className="btn-primary w-full block text-center py-3 text-lg">
              Ir al inicio ahora
            </Link>
          </>
        ) : (
          <>
            <p className="text-gray-400">Inicia sesión para continuar.</p>
            <Link to="/login" className="btn-primary w-full block text-center py-3 text-lg">
              Ir a Iniciar sesión
            </Link>
          </>
        )}
        <p className="text-gray-500 text-sm">
          Si no fuiste redirigido automáticamente, haz clic en el botón.
        </p>
      </div>
    </div>
  );
};

export default ConfirmacionExitosa;