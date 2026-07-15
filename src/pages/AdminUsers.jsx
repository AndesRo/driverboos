import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_users_with_suscripciones');
    if (error) {
      console.error(error);
      alert('Error al cargar usuarios');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId, action, days = 0) => {
    if (!confirm(`¿Estás seguro de ${action}?`)) return;
    try {
      if (action === 'activate') {
        const hoy = new Date().toISOString().split('T')[0];
        const { error } = await supabase
          .from('suscripciones')
          .update({
            estado: 'activa',
            fecha_inicio: hoy,
            fecha_vencimiento: hoy,
          })
          .eq('user_id', userId);
        if (error) throw error;
      } else if (action === 'deactivate') {
        const { error } = await supabase
          .from('suscripciones')
          .update({ estado: 'vencida' })
          .eq('user_id', userId);
        if (error) throw error;
      } else if (action === 'renew') {
        const { data: sub, error: fetchError } = await supabase
          .from('suscripciones')
          .select('fecha_vencimiento')
          .eq('user_id', userId)
          .single();
        if (fetchError) throw fetchError;
        let newVencimiento;
        if (sub.fecha_vencimiento) {
          const venc = new Date(sub.fecha_vencimiento);
          const hoy = new Date();
          hoy.setHours(0,0,0,0);
          const baseDate = venc >= hoy ? venc : hoy;
          newVencimiento = new Date(baseDate);
          newVencimiento.setDate(newVencimiento.getDate() + days);
        } else {
          newVencimiento = new Date();
          newVencimiento.setDate(newVencimiento.getDate() + days);
        }
        const newVencStr = newVencimiento.toISOString().split('T')[0];
        const { error: updateError } = await supabase
          .from('suscripciones')
          .update({
            estado: 'activa',
            fecha_vencimiento: newVencStr,
            fecha_inicio: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userId);
        if (updateError) throw updateError;
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error en acción:', error);
      alert('Error: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.user_id.includes(search)
  );

  if (loading) return <div className="text-center">Cargando usuarios...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por email..."
          className="input-lg w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#2d2d2d] border-b border-[#444]">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Fecha Inicio</th>
              <th className="p-2 text-left">Fecha Vencimiento</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.user_id} className="border-b border-[#444]">
                <td className="p-2">{user.email || user.user_id}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded ${user.estado === 'activa' ? 'bg-green-700' : 'bg-red-700'}`}>
                    {user.estado || 'vencida'}
                  </span>
                </td>
                <td className="p-2">{user.fecha_inicio || '-'}</td>
                <td className="p-2">{user.fecha_vencimiento || '-'}</td>
                <td className="p-2 space-x-1 flex flex-wrap gap-1">
                  <button onClick={() => handleAction(user.user_id, 'activate')} className="btn-primary text-xs px-2 py-1">Activar</button>
                  <button onClick={() => handleAction(user.user_id, 'deactivate')} className="btn-secondary text-xs px-2 py-1">Desactivar</button>
                  <button onClick={() => handleAction(user.user_id, 'renew', 30)} className="btn-primary text-xs px-2 py-1">+30</button>
                  <button onClick={() => handleAction(user.user_id, 'renew', 60)} className="btn-primary text-xs px-2 py-1">+60</button>
                  <button onClick={() => handleAction(user.user_id, 'renew', 90)} className="btn-primary text-xs px-2 py-1">+90</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;