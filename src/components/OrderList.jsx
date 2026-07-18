import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const OrderList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchComunas = async () => {
      const { data, error } = await supabase.from('tarifas').select('comuna');
      if (!error) setComunas(data.map(c => c.comuna));
    };
    fetchComunas();
  }, []);

  const fetchOrders = async (date) => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('fecha', date)
      .order('ruta', { ascending: true });
    if (!error) {
      setOrders(data);
    } else {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(filterDate);
  }, [filterDate, user]);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta orden?')) return;
    await supabase.from('orders').delete().eq('id', id);
    fetchOrders(filterDate);
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
    fetchOrders(filterDate);
  };

  const totalBruto = orders.reduce((acc, o) => acc + (o.monto_bruto || 0), 0);
  const entregados = orders.filter(o => o.estado === 'entregado').length;
  const parciales = orders.filter(o => o.estado === 'parcial').length;
  const noEntregados = orders.filter(o => o.estado === 'no_entregado').length;

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#1a1a1a]">
      {/* Cabecera fija */}
      <div className="sticky top-0 z-10 bg-[#1a1a1a] p-4 pb-2 border-b border-[#444]">
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm font-medium text-gray-300">Fecha:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-900/30 p-2 rounded text-center border border-green-700">
            <span className="text-green-400 font-bold">✅ {entregados}</span>
          </div>
          <div className="bg-yellow-900/30 p-2 rounded text-center border border-yellow-700">
            <span className="text-yellow-400 font-bold">⚠️ {parciales}</span>
          </div>
          <div className="bg-red-900/30 p-2 rounded text-center border border-red-700">
            <span className="text-red-400 font-bold">❌ {noEntregados}</span>
          </div>
        </div>

        <div className="text-right font-semibold text-gray-300 mt-2">
          Total bruto: <span className="text-primary">${totalBruto}</span>
        </div>
      </div>

      {/* Lista con scroll */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 pt-2 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500">Cargando órdenes...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No hay órdenes para esta fecha</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card">
              {editingId === order.id ? (
                <div className="edit-form space-y-2">
                  <input
                    name="order_number"
                    value={editForm.order_number || ''}
                    onChange={handleEditChange}
                    placeholder="N° orden"
                    className="w-full"
                  />
                  <select name="comuna" value={editForm.comuna || ''} onChange={handleEditChange} className="w-full">
                    <option value="">Seleccionar comuna</option>
                    {comunas.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    name="ruta"
                    type="text"
                    value={editForm.ruta || ''}
                    onChange={handleEditChange}
                    placeholder="Ruta"
                    className="w-full"
                  />
                  <input
                    name="fecha"
                    type="date"
                    value={editForm.fecha || ''}
                    onChange={handleEditChange}
                    className="w-full"
                  />
                  <select name="estado" value={editForm.estado || ''} onChange={handleEditChange} className="w-full">
                    <option value="entregado">Entregado</option>
                    <option value="parcial">Parcial</option>
                    <option value="no_entregado">No entregado</option>
                  </select>
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1" onClick={saveEdit}>
                      Guardar
                    </button>
                    <button className="btn-secondary flex-1" onClick={cancelEdit}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-lg">{order.order_number}</span>
                    <span className="ml-2 text-sm text-gray-400">{order.comuna}</span>
                    <div className="text-sm text-gray-400">
                      Ruta {order.ruta || 'Sin ruta'} - {order.fecha}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${order.monto_bruto}</div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.estado === 'entregado'
                          ? 'bg-green-700'
                          : order.estado === 'parcial'
                          ? 'bg-yellow-700'
                          : 'bg-red-700'
                      }`}
                    >
                      {order.estado}
                    </span>
                    <div className="mt-2 flex gap-1">
                      <button className="text-blue-400 text-xs" onClick={() => startEdit(order)}>
                        ✏️
                      </button>
                      <button className="text-red-400 text-xs" onClick={() => handleDelete(order.id)}>
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