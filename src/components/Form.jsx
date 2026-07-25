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
    <div className="p-2 space-y-2 max-w-full h-full flex flex-col">
      <h2 className="text-xl font-bold text-primary text-center">📄 Información de Boleta</h2>

      {/* Datos de la boleta en formato compacto */}
      <div className="card p-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Fecha:</span>
          <span>{today}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">RUT:</span>
          <span>76.456.187-2</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Giro:</span>
          <span>Transporte</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Enviar a:</span>
          <span className="text-xs truncate">finanzas@boosmap.com</span>
        </div>
      </div>

      {/* Prestación + Botones agrupados en una fila compacta */}
      <div className="card p-3">
        <p className="text-sm text-gray-300 font-medium">Remuneración booster - Junio</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => window.open('https://homer.sii.cl/', '_blank')}
            className="btn-secondary flex-1 text-xs py-2 px-2 min-h-[40px]"
          >
            📋 SII
          </button>
          <button
            onClick={enviarBoleta}
            className="btn-primary flex-1 text-xs py-2 px-2 min-h-[40px]"
          >
            ✉️ Finanzas
          </button>
          <button
            onClick={contactarSAF}
            className="btn-secondary flex-1 text-xs py-2 px-2 min-h-[40px]"
          >
            💬 SAF
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 text-center">
          finanzas@boosmap.com · saf@boosmap.com
        </p>
      </div>

      {/* Formularios externos en una fila compacta */}
      <div className="card p-3">
        <div className="flex gap-2">
          <a
            href="https://boosmap.typeform.com/to/sFgws2bM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center text-xs py-2 px-2 min-h-[40px]"
          >
            📋 JUMBO VA
          </a>
          <a
            href="https://boosmap.typeform.com/to/tVQ0iVHF"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center text-xs py-2 px-2 min-h-[40px]"
          >
            📋 EXTRAS
          </a>
        </div>
      </div>
    </div>
  );
};

export default Form;