import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ⚠️ Reemplaza estos datos con los reales del administrador
const DATOS_BANCARIOS = {
  banco: 'mercado pago',
  tipoCuenta: 'Cuenta vista',
  numeroCuenta: '1086625187',
  titular: 'Andres Isaias Romero Millaquen',
  rut: '15.246.940-3',
  email: 'andespart@yahoo.com',
};

const SubscriptionBlocked = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(null);

  const handleCopy = async (valor, campo) => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(campo);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      // Si el navegador bloquea el clipboard (poco común), simplemente no mostramos feedback
    }
  };

  const handleContact = () => {
    const nombre = user?.user_metadata?.nombre || 'Usuario';
    const email = user?.email || '';

    const mensaje =
      `Hola, ya realicé la transferencia para renovar mi suscripción de Driver Boos.\n\n` +
      `Nombre: ${nombre}\n` +
      `Correo: ${email}\n\n` +
      `Quedo atento para que actives mi cuenta. ¡Gracias!`;

    window.open(`https://wa.me/56997416485?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a1a1a]">
      <div className="card w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-primary">⛔ Suscripción vencida</h1>

        <p className="text-gray-300">
          Tu período gratuito de 7 días ha finalizado. Para continuar utilizando{' '}
          <span className="font-semibold text-white">Driver Boos</span> debes renovar tu
          suscripción.
        </p>

        <div className="bg-[#3d3d3d] p-4 rounded-lg">
          <p className="text-2xl font-bold text-primary">$2.490</p>
          <p className="text-gray-400 text-sm">al mes</p>
        </div>

        {/* Datos bancarios */}
        <div className="bg-[#3d3d3d] p-4 rounded-lg text-left space-y-2">
          <p className="text-white font-semibold text-center mb-2">
            💳 Datos para transferencia
          </p>

          {[
            { label: 'Banco', valor: DATOS_BANCARIOS.banco, campo: 'banco' },
            { label: 'Tipo de cuenta', valor: DATOS_BANCARIOS.tipoCuenta, campo: 'tipo' },
            { label: 'N° de cuenta', valor: DATOS_BANCARIOS.numeroCuenta, campo: 'cuenta' },
            { label: 'Titular', valor: DATOS_BANCARIOS.titular, campo: 'titular' },
            { label: 'RUT', valor: DATOS_BANCARIOS.rut, campo: 'rut' },
            { label: 'Email', valor: DATOS_BANCARIOS.email, campo: 'correo' },
          ].map(({ label, valor, campo }) => (
            <div
              key={campo}
              className="flex items-center justify-between gap-2 border-b border-[#4d4d4d] last:border-0 pb-1.5 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="text-white text-sm truncate">{valor}</p>
              </div>
              <button
                onClick={() => handleCopy(valor, campo)}
                className="shrink-0 text-xs px-2 py-1 rounded bg-[#4d4d4d] hover:bg-[#5d5d5d] text-gray-200 transition"
              >
                {copiado === campo ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          ))}

          <p className="text-gray-500 text-xs pt-2">
            Monto a transferir: <span className="text-primary font-semibold">$2.490</span>
          </p>
        </div>

        <button
          onClick={handleContact}
          className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
        >
          <span>📱</span> Contactar al Administrador
        </button>

        <p className="text-gray-500 text-sm">
          Realiza la transferencia con los datos de arriba o contacata al administrador para activar tu cuenta. Tu cuenta se activará una vez confirmado el pago.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="text-primary hover:underline text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBlocked;