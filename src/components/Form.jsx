import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Form = () => {
  const { user } = useAuth();
  const [showBoleta, setShowBoleta] = useState(false);
  const [copied, setCopied] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const nombreCompleto = user?.user_metadata?.nombre && user?.user_metadata?.apellido
    ? `${user.user_metadata.nombre} ${user.user_metadata.apellido}`
    : user?.email || 'Usuario';

  // Datos de la boleta
  const boletaData = {
    fecha: today,
    nombre: 'INVERSIONES ASINARA SPA',
    rut: '76.456.187-2',
    direccion: 'AV. ANDRES BELLO 2777 Piso 19 Oficina 01, LAS CONDES',
    giro: 'OTRAS ACTIVIDADES CONEXAS AL TRANSPORTE',
    email: 'finanzas@boosmap.com'
  };

  // Texto formateado para copiar
  const boletaTexto = `
Datos de la boleta:
Fecha: ${boletaData.fecha}
A nombre de: ${boletaData.nombre}
RUT: ${boletaData.rut}
Dirección: ${boletaData.direccion}
Giro: ${boletaData.giro}
Enviar a: ${boletaData.email}
  `.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boletaTexto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('No se pudo copiar: ' + err.message);
    }
  };

  const enviarBoleta = () => {
    const asunto = encodeURIComponent('Boleta de honorarios - ' + nombreCompleto);
    const cuerpo = encodeURIComponent(
      `Estimados,\n\nAdjunto mi boleta de honorarios correspondiente al mes de Junio.\n\nSaludos cordiales,\n${nombreCompleto}`
    );
    window.open(`mailto:finanzas@boosmap.com?subject=${asunto}&body=${cuerpo}`, '_blank');
  };

  const contactarSAF = () => {
    const asunto = encodeURIComponent('Consulta SAF - ' + nombreCompleto);
    const cuerpo = encodeURIComponent(
      `Hola,\n\nMe comunico para consultar sobre...\n\nNombre: ${nombreCompleto}\nEmail: ${user?.email || ''}\n\nSaludos.`
    );
    window.open(`mailto:saf@boosmap.com?subject=${asunto}&body=${cuerpo}`, '_blank');
  };

  return (
    <div className="p-4 space-y-6 max-w-full">


      {/* Tarjeta: Prestación + Botones agrupados */}
      <div className="card">
  
        

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.open('https://homer.sii.cl/', '_blank')}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            📋 Ir al SII
          </button>
          <button
            onClick={enviarBoleta}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            ✉️ Enviar boleta
          </button>
          <button
            onClick={contactarSAF}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            💬 Contactar SAF
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          finanzas@boosmap.com · saf@boosmap.com
        </p>
      </div>

      {/* Tarjeta: Datos de boleta (colapsable) */}
      <div className="card">
        <button
          onClick={() => setShowBoleta(!showBoleta)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="font-semibold text-lg text-white">
            📋 Datos de la boleta
          </span>
          <span className="text-primary text-2xl">
            {showBoleta ? '−' : '+'}
          </span>
        </button>

        {showBoleta && (
          <div className="mt-4 p-4 bg-[#3d3d3d] rounded-lg space-y-2">
            <div className="space-y-1 text-gray-300 text-sm">
              <p><span className="font-medium text-gray-400">Fecha:</span> {boletaData.fecha}</p>
              <p><span className="font-medium text-gray-400">A nombre de:</span> {boletaData.nombre}</p>
              <p><span className="font-medium text-gray-400">RUT:</span> {boletaData.rut}</p>
              <p><span className="font-medium text-gray-400">Dirección:</span> {boletaData.direccion}</p>
              <p><span className="font-medium text-gray-400">Giro:</span> {boletaData.giro}</p>
              <p><span className="font-medium text-gray-400">Enviar a:</span> {boletaData.email}</p>
            </div>
            <button
              onClick={handleCopy}
              className="mt-2 btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2"
            >
              {copied ? '✅ Copiado' : '📋 Copiar datos'}
            </button>
          </div>
        )}
      </div>

      {/* Tarjeta: Formularios externos */}
      <div className="card">
        <h3 className="font-semibold text-lg text-white mb-3">Formularios de Registros</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://boosmap.typeform.com/to/sFgws2bM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center"
          >
            📋 JUMBO VA
          </a>
          <a
            href="https://boosmap.typeform.com/to/tVQ0iVHF"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center"
          >
            📋 EXTRAS
          </a>
        </div>
      </div>
    </div>
  );
};

export default Form;