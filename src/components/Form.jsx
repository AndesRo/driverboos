import { useAuth } from '../context/AuthContext';

const Form = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const nombreCompleto = user?.user_metadata?.nombre && user?.user_metadata?.apellido
    ? `${user.user_metadata.nombre} ${user.user_metadata.apellido}`
    : user?.email || 'Usuario';

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
    <div className="p-3 space-y-3 h-full flex flex-col">
      <h2 className="text-xl font-bold text-primary">📄 Información de Boleta</h2>

      {/* Tarjeta de datos de boleta compacta */}
      <div className="card p-3 text-sm space-y-1">
        <div className="grid grid-cols-2 gap-x-2 text-gray-300">
          <span className="text-gray-400">Fecha:</span>
          <span>{today}</span>
          <span className="text-gray-400">RUT:</span>
          <span>76.456.187-2</span>
          <span className="text-gray-400">Giro:</span>
          <span className="text-xs">Otras activ. conexas al transporte</span>
        </div>
        <div className="text-xs text-gray-400">
          INVERSIONES ASINARA SPA - AV. ANDRES BELLO 2777 Piso 19 Of. 01, LAS CONDES
        </div>
        <div className="text-xs text-primary">
          Enviar a: finanzas@boosmap.com
        </div>
      </div>

      {/* Prestación + Botones agrupados */}
      <div className="card p-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white text-sm">Remuneración booster - Junio</span>
          <button
            onClick={() => window.open('https://homer.sii.cl/', '_blank')}
            className="btn-secondary text-xs py-1 px-2 min-h-0"
          >
            📋 SII
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={enviarBoleta}
            className="btn-primary flex-1 text-sm py-2 min-h-0"
          >
            ✉️ Finanzas
          </button>
          <button
            onClick={contactarSAF}
            className="btn-secondary flex-1 text-sm py-2 min-h-0"
          >
            💬 SAF
          </button>
        </div>
      </div>

      {/* Formularios externos */}
      <div className="card p-3">
        <div className="flex flex-wrap gap-2">
          <a
            href="https://boosmap.typeform.com/to/sFgws2bM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-sm py-2 min-h-0 text-center"
          >
            📋 JUMBO VA
          </a>
          <a
            href="https://boosmap.typeform.com/to/tVQ0iVHF"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-sm py-2 min-h-0 text-center"
          >
            📋 EXTRAS
          </a>
        </div>
      </div>
    </div>
  );
};

export default Form;