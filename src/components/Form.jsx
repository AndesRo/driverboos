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
    <div className="p-3 max-w-full">

      {/* Antes: card space-y-4 con padding p-5 por defecto. Ahora p-4 en el
          card + space-y-3 entre secciones: menos aire, misma información. */}
      <div className="card p-4 space-y-3">
        {/* Sección 1: Datos de la boleta.
            Antes: grid-cols-1 sm:grid-cols-2 -> en cualquier teléfono
            (menor a 640px) caía a 1 columna, apilando las 6 líneas.
            Ahora: grid-cols-2 SIEMPRE. Fecha/RUT (cortos) van pareados
            desde el primer píxel; los campos largos siguen ocupando el
            ancho completo con col-span-2 (sin esperar el breakpoint sm). */}
        <div>
          <h3 className="font-semibold text-base text-white mb-1.5">Datos de la boleta de honorarios</h3>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-gray-300">
            <p><span className="font-medium text-gray-400">Fecha:</span> {today}</p>
            <p><span className="font-medium text-gray-400">RUT:</span> 76.456.187-2</p>
            <p className="col-span-2">
              <span className="font-medium text-gray-400">A nombre de:</span> INVERSIONES ASINARA SPA
            </p>
            <p className="col-span-2">
              <span className="font-medium text-gray-400">Dirección:</span> AV. ANDRES BELLO 2777 Piso 19 Oficina 01, LAS CONDES
            </p>
            <p className="col-span-2">
              <span className="font-medium text-gray-400">Giro:</span> OTRAS ACTIVIDADES CONEXAS AL TRANSPORTE
            </p>
            <p className="col-span-2">
              <span className="font-medium text-gray-400">Enviar a:</span> finanzas@boosmap.com
            </p>
          </div>
        </div>

        <div className="border-t border-[#444]"></div>

        {/* Sección 2: Prestación y acciones.
            Antes: flex-col sm:flex-row -> 3 botones de 54px apilados en
            móvil (~186px solo de botones). Ahora: flex-row fijo, con
            min-h-0 + padding/texto reducidos (igual que hicimos con las
            tarjetas de "Extras" en OrderForm) para que los 3 quepan en
            una sola fila sin desbordar. flex-wrap como red de seguridad
            en pantallas extremadamente angostas. */}
        <div>
          <div className="flex flex-row flex-wrap gap-2">
            <button
              onClick={() => window.open('https://homer.sii.cl/', '_blank')}
              className="btn-secondary flex-1 min-h-0 px-2 py-2 text-xs flex items-center justify-center gap-1"
            >
              📋 SII
            </button>
            <button
              onClick={enviarBoleta}
              className="btn-primary flex-1 min-h-0 px-2 py-2 text-xs flex items-center justify-center gap-1"
            >
              ✉️ Boleta
            </button>
            <button
              onClick={contactarSAF}
              className="btn-secondary flex-1 min-h-0 px-2 py-2 text-xs flex items-center justify-center gap-1"
            >
              💬 SAF
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            finanzas@boosmap.com · saf@boosmap.com
          </p>
        </div>

        <div className="border-t border-[#444]"></div>

        {/* Sección 3: Formularios externos. Mismo tratamiento compacto. */}
        <div>
          <div className="flex flex-row flex-wrap gap-2">
            <a
              href="https://boosmap.typeform.com/to/sFgws2bM"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 min-h-0 px-2 py-2 text-xs text-center flex items-center justify-center gap-1"
            >
              📋 JUMBO VA
            </a>
            <a
              href="https://boosmap.typeform.com/to/tVQ0iVHF"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 min-h-0 px-2 py-2 text-xs text-center flex items-center justify-center gap-1"
            >
              📋 EXTRAS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;