import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SubscriptionBanner = () => {
  const { suscripcion } = useAuth();
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    if (!suscripcion || !suscripcion.fecha_vencimiento) {
      setDaysLeft(null);
      return;
    }
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const venc = new Date(suscripcion.fecha_vencimiento);
    venc.setHours(0,0,0,0);
    const diffTime = venc - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 5 && diffDays >= 0) {
      setDaysLeft(diffDays);
    } else {
      setDaysLeft(null);
    }
  }, [suscripcion]);

  if (!daysLeft && daysLeft !== 0) return null;

  return (
    <div className="bg-yellow-600 text-white p-2 text-center text-sm">
      ⚠️ Tu suscripción vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}.
      <Link to="/subscription-blocked" className="underline ml-2">Renovar ahora</Link>
    </div>
  );
};

export default SubscriptionBanner;