import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const OrderList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar comunas para el select de edición
  useEffect(() => {
    const fetchComunas = async () => {
      const { data, error } = await supabase.from('tarifas').select('comuna');
      if (!error) setComunas(data.map(c => c.comuna));
    };
    fetchComunas();
  }, []);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      // Si no está en modo "ver todas", filtrar por fecha
      if (!showAll && filterDate) {
        query = query.eq('fecha', filterDate);
      }

      const { data, error: queryError } = await query.order('created_at', { ascending: false });

      if (queryError) {
        console.error('Error al cargar órdenes:', queryError);
        setError('Error al cargar las órdenes: ' + queryError.message);
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar las órdenes.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar órdenes cuando cambia el filtro o el usuario
  useEffect(() => {
    fetchOrders();
  }, [filterDate, showAll, user]);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta orden?')) return;
    await supabase.from('orders').delete().eq('id', id);
    fetchOrders();
  };

  const startEdit = (order) => {
    setEditingId(order.id);
    setEditForm(order);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    const { id, ...updates } = editForm;
    await supabase.from('orders').update(updates).eq('id', id);
    setEditingId(null);
    fetchOrders();
  };

  // Cálculo de totales
  const totalBruto = orders.reduce((acc, o) => acc + (o.monto_bruto || 0), 0);
  const entregados = orders.filter(o => o.estado === 'entregado').length;
  const parciales = orders.filter(o => o.estado === 'parcial').length;
  const noEntregados = orders.filter(o => o.estado === 'no_entregado').length;

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Cabecera fija */}
      <div className="sticky top-0 z-10 bg-[#1a1a1a] pb-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-gray-300">Fecha:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="flex-1 min-w-[120px]"
            disabled={showAll}
          />
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              showAll ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showAll ? '📅 Ver por fecha' : '📋 Ver todas'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-900/30 p-2 rounded text-center border border-green-700 text-sm">
            ✅ {entregados}
          </div>
          <div className="bg-yellow-900/30 p-2 rounded text-center border border-yellow-700 text-sm">
            ⚠️ {parciales}
          </div>
          <div className="bg-red-900/30 p-2 rounded text-center border border-red-700 text-sm">
            ❌ {noEntregados}
          </div>
        </div>
        <div className="text-right font-semibold text-lg">
          Total bruto: ${totalBruto}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {/* Lista de órdenes con scroll */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-3 pb-4">
        {loading ? (
          <p className="text-center text-gray-400">Cargando...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">
            {showAll ? 'No hay órdenes registradas' : 'No hay órdenes para esta fecha'}
          </p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card p-3">
              {editingId === order.id ? (
                // Modo edición
                <div className="space-y-2">
                  <input
                    name="order_number"
                    value={editForm.order_number || ''}
                    onChange={handleEditChange}
                    placeholder="N° orden"
                    className="w-full"
                  />
                  <select
                    name="comuna"
                    value={editForm.comuna || ''}
                    onChange={handleEditChange}
                    className="w-full"
                  >
                    <option value="">Seleccionar comuna</option>
                    {comunas.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    name="fecha"
                    type="date"
                    value={editForm.fecha || ''}
                    onChange={handleEditChange}
                    className="w-full"
                  />
                  <select
                    name="estado"
                    value={editForm.estado || 'entregado'}
                    onChange={handleEditChange}
                    className="w-full"
                  >
                    <option value="entregado">Entregado</option>
                    <option value="parcial">Parcial</option>
                    <option value="no_entregado">No entregado</option>
                  </select>
                  <input
                    name="notas"
                    placeholder="Notas (opcional)"
                    value={editForm.notas || ''}
                    onChange={handleEditChange}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1" onClick={saveEdit}>Guardar</button>
                    <button className="btn-secondary flex-1" onClick={cancelEdit}>Cancelar</button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-lg font-bold text-white truncate">
                      {order.order_number}
                    </div>
                    <div className="text-sm text-gray-300">
                      {order.comuna}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.fecha}
                      {order.notas && (
                        <span className="ml-2 text-primary-300">📝 {order.notas}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <div className="font-bold text-primary">${order.monto_bruto}</div>
                    <span className={`text-xs px-2 py-1 rounded inline-block ${
                      order.estado === 'entregado' ? 'bg-green-700' :
                      order.estado === 'parcial' ? 'bg-yellow-700' :
                      'bg-red-700'
                    }`}>
                      {order.estado}
                    </span>
                    <div className="mt-1 flex gap-1 justify-end">
                      <button
                        className="text-blue-400 text-xs p-1"
                        onClick={() => startEdit(order)}
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-400 text-xs p-1"
                        onClick={() => handleDelete(order.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;