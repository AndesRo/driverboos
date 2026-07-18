import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Report = () => {
  const { user } = useAuth();
  const [ordersWithExtras, setOrdersWithExtras] = useState([]);
  const [extrasSummary, setExtrasSummary] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBruto, setTotalBruto] = useState(0);
  const [totalExtras, setTotalExtras] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Obtener órdenes con sus extras
      let query = supabase
        .from('orders')
        .select(`
          *,
          extras (tipo, monto, nota, id)
        `)
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('fecha', startDate);
      }
      if (endDate) {
        query = query.lte('fecha', endDate);
      }

      const { data: orders, error: queryError } = await query.order('fecha', { ascending: false });

      if (queryError) {
        console.error('Error en consulta:', queryError);
        setError('Error al cargar los datos: ' + queryError.message);
        setLoading(false);
        return;
      }

      // 2. Obtener todos los extras (para el resumen)
      let extrasQuery = supabase
        .from('extras')
        .select('*')
        .eq('user_id', user.id);

      if (startDate) {
        extrasQuery = extrasQuery.gte('fecha', startDate);
      }
      if (endDate) {
        extrasQuery = extrasQuery.lte('fecha', endDate);
      }

      const { data: extrasData, error: extrasError } = await extrasQuery.order('fecha', { ascending: false });

      if (extrasError) {
        console.error('Error al obtener extras:', extrasError);
      }

      // 3. Procesar órdenes
      let totalBrutoOrdenes = 0;
      const enrichedOrders = (orders || []).map((order) => {
        const extras = order.extras || [];
        const totalExtrasPorOrden = extras.reduce((sum, e) => sum + (e.monto || 0), 0);
        const totalOrden = (order.monto_bruto || 0) + totalExtrasPorOrden;
        totalBrutoOrdenes += totalOrden;
        return {
          ...order,
          extras,
          totalOrden,
        };
      });

      // 4. Procesar extras para resumen por tipo
      const summaryMap = {};
      (extrasData || []).forEach((extra) => {
        const tipo = extra.tipo || 'sin_tipo';
        if (!summaryMap[tipo]) {
          summaryMap[tipo] = { tipo, cantidad: 0, total: 0 };
        }
        summaryMap[tipo].cantidad += 1;
        summaryMap[tipo].total += extra.monto || 0;
      });
      const summaryArray = Object.values(summaryMap);

      const totalExtrasMonto = summaryArray.reduce((sum, item) => sum + item.total, 0);
      const totalBrutoGeneral = totalBrutoOrdenes + totalExtrasMonto;

      setOrdersWithExtras(enrichedOrders);
      setExtrasSummary(summaryArray);
      setTotalBruto(totalBrutoGeneral);
      setTotalExtras(totalExtrasMonto);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, user]);

  const retencion = totalBruto * 0.1525;
  const neto = totalBruto - retencion;

  const exportExcel = () => {
    const data = ordersWithExtras.map((o) => ({
      'N° Orden': o.order_number || '',
      Comuna: o.comuna || '',
      Ruta: o.ruta || 'Sin ruta',
      Fecha: o.fecha || '',
      Estado: o.estado || '',
      'Monto Bruto': o.monto_bruto || 0,
      'Extra Peso': o.extras.find((e) => e.tipo === 'extra_peso')?.monto || 0,
      Tag: o.extras.find((e) => e.tipo === 'tag')?.monto || 0,
      Capacitación: o.extras.find((e) => e.tipo === 'capacitacion')?.monto || 0,
      Total: o.totalOrden || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `reporte_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Reporte de entregas y extras', 14, 16);
      doc.text(`Total bruto (órdenes + extras): $${totalBruto}`, 14, 26);
      doc.text(`Retención (15.25%): $${retencion.toFixed(0)}`, 14, 32);
      doc.text(`Neto: $${neto.toFixed(0)}`, 14, 38);

      if (ordersWithExtras.length > 0) {
        const tableData = ordersWithExtras.map((o) => [
          o.order_number || '',
          o.comuna || '',
          o.ruta || 'Sin ruta',
          o.fecha || '',
          o.estado || '',
          `$${o.monto_bruto || 0}`,
          `$${o.extras.find((e) => e.tipo === 'extra_peso')?.monto || 0}`,
          `$${o.extras.find((e) => e.tipo === 'tag')?.monto || 0}`,
          `$${o.extras.find((e) => e.tipo === 'capacitacion')?.monto || 0}`,
          `$${o.totalOrden || 0}`,
        ]);
        autoTable(doc, {
          head: [['N°', 'Comuna', 'Ruta', 'Fecha', 'Estado', 'Bruto', 'Extra Peso', 'Tag', 'Capacitación', 'Total']],
          body: tableData,
          startY: 44,
          theme: 'striped',
          styles: { fontSize: 7 },
          headStyles: { fillColor: [255, 140, 0] },
        });
      } else {
        doc.text('No hay órdenes para el período seleccionado.', 14, 50);
      }

      doc.save(`reporte_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      alert('Error al generar PDF: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando reporte...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-primary mb-4">Reporte financiero</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-auto flex-1"
        />
        <span className="text-gray-400">a</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-auto flex-1"
        />
        <button
          className="btn-secondary"
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
        >
          Limpiar
        </button>
      </div>

      {/* Resumen de órdenes y extras */}
      <div className="card space-y-2 mb-4">
        <h3 className="font-semibold text-lg">Resumen de órdenes</h3>
        <div className="flex justify-between">
          <span>Total órdenes</span>
          <span>{ordersWithExtras.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Monto bruto de órdenes</span>
          <span>${ordersWithExtras.reduce((acc, o) => acc + (o.monto_bruto || 0), 0)}</span>
        </div>
        <hr className="border-[#444]" />
        <h3 className="font-semibold text-lg">Resumen de extras</h3>
        {extrasSummary.length === 0 ? (
          <p className="text-gray-400">No hay extras registrados en este período.</p>
        ) : (
          extrasSummary.map((item) => (
            <div key={item.tipo} className="flex justify-between">
              <span>
                {item.tipo === 'extra_peso' && 'Extra peso'}
                {item.tipo === 'tag' && 'Tag'}
                {item.tipo === 'capacitacion' && 'Capacitación'}
                {item.tipo === 'sin_moradores' && 'Sin moradores'}
                {!['extra_peso', 'tag', 'capacitacion', 'sin_moradores'].includes(item.tipo) && item.tipo}
                {' (' + item.cantidad + ')'}
              </span>
              <span>${item.total}</span>
            </div>
          ))
        )}
        <hr className="border-[#444]" />
        <div className="flex justify-between font-bold">
          <span>Total bruto general (órdenes + extras)</span>
          <span>${totalBruto}</span>
        </div>
        <div className="flex justify-between">
          <span>Retención (15.25%)</span>
          <span>${retencion.toFixed(0)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-primary">
          <span>Neto</span>
          <span>${neto.toFixed(0)}</span>
        </div>
      </div>

      {/* Botones de exportación */}
      <div className="flex gap-2 mt-4">
        <button className="btn-primary flex-1" onClick={exportExcel}>
          📊 Excel
        </button>
        <button className="btn-primary flex-1" onClick={exportPDF}>
          📄 PDF
        </button>
      </div>

      {/* Tabla de órdenes con extras */}
      <div className="mt-6">
        <h3 className="font-semibold">Detalle de órdenes</h3>
        {ordersWithExtras.length === 0 ? (
          <p className="text-center text-gray-400 mt-2">No hay órdenes para el período seleccionado.</p>
        ) : (
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead className="bg-[#2d2d2d]">
                <tr>
                  <th className="p-2 text-left">N°</th>
                  <th className="p-2 text-left">Comuna</th>
                  <th className="p-2 text-left">Ruta</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Estado</th>
                  <th className="p-2 text-left">Bruto</th>
                  <th className="p-2 text-left">Extra Peso</th>
                  <th className="p-2 text-left">Tag</th>
                  <th className="p-2 text-left">Capacitación</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {ordersWithExtras.map((o) => (
                  <tr key={o.id} className="border-b border-[#444]">
                    <td className="p-2">{o.order_number}</td>
                    <td className="p-2">{o.comuna}</td>
                    <td className="p-2">{o.ruta || 'Sin ruta'}</td>
                    <td className="p-2">{o.fecha}</td>
                    <td className="p-2">{o.estado}</td>
                    <td className="p-2">${o.monto_bruto}</td>
                    <td className="p-2">${o.extras.find((e) => e.tipo === 'extra_peso')?.monto || 0}</td>
                    <td className="p-2">${o.extras.find((e) => e.tipo === 'tag')?.monto || 0}</td>
                    <td className="p-2">${o.extras.find((e) => e.tipo === 'capacitacion')?.monto || 0}</td>
                    <td className="p-2 font-bold">${o.totalOrden}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;