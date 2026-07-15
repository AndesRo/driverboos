import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    pendingPayments: 0,
    renewalsThisMonth: 0,
    estimatedIncome: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Total usuarios (usando suscripciones para contar únicos)
      const { data: users } = await supabase.from('suscripciones').select('user_id');
      const uniqueUsers = new Set(users?.map(u => u.user_id) || []);
      const totalUsers = uniqueUsers.size;

      const hoy = new Date().toISOString().split('T')[0];
      const { data: activeSubs } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('estado', 'activa')
        .gte('fecha_vencimiento', hoy);
      const activeSubscriptions = activeSubs?.length || 0;

      const { data: expiredSubs } = await supabase
        .from('suscripciones')
        .select('*')
        .or(`estado.eq.vencida, fecha_vencimiento.lt.${hoy}`);
      const expiredSubscriptions = expiredSubs?.length || 0;

      const { data: pendingPayments } = await supabase
        .from('solicitudes_pago')
        .select('*')
        .eq('estado', 'pendiente');
      const pendingPaymentsCount = pendingPayments?.length || 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      const startStr = startOfMonth.toISOString();
      const { data: renewals } = await supabase
        .from('suscripciones')
        .select('*')
        .gte('updated_at', startStr);
      const renewalsThisMonth = renewals?.length || 0;

      const estimatedIncome = activeSubscriptions * 3000;

      setStats({
        totalUsers,
        activeSubscriptions,
        expiredSubscriptions,
        pendingPayments: pendingPaymentsCount,
        renewalsThisMonth,
        estimatedIncome,
      });

      // Datos para gráfico de barras (últimos 6 meses)
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toISOString().slice(0,7);
        months.push(monthStr);
      }
      const barData = await Promise.all(months.map(async (month) => {
        const start = month + '-01';
        const end = month + '-31';
        const { data } = await supabase
          .from('suscripciones')
          .select('id')
          .gte('updated_at', start)
          .lt('updated_at', end);
        return { mes: month, renovaciones: data?.length || 0 };
      }));
      setChartData(barData);

      setPieData([
        { name: 'Activas', value: activeSubscriptions },
        { name: 'Vencidas', value: expiredSubscriptions },
      ]);
    };

    fetchStats();
  }, []);

  const COLORS = ['#ff8c00', '#444'];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-gray-400">Usuarios registrados</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="card">
          <p className="text-gray-400">Suscripciones activas</p>
          <p className="text-2xl font-bold text-green-400">{stats.activeSubscriptions}</p>
        </div>
        <div className="card">
          <p className="text-gray-400">Suscripciones vencidas</p>
          <p className="text-2xl font-bold text-red-400">{stats.expiredSubscriptions}</p>
        </div>
        <div className="card">
          <p className="text-gray-400">Solicitudes de pago pendientes</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pendingPayments}</p>
        </div>
        <div className="card">
          <p className="text-gray-400">Renovaciones este mes</p>
          <p className="text-2xl font-bold">{stats.renewalsThisMonth}</p>
        </div>
        <div className="card">
          <p className="text-gray-400">Ingresos estimados</p>
          <p className="text-2xl font-bold text-primary">${stats.estimatedIncome}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Renovaciones por mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="mes" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: 'none' }} />
              <Bar dataKey="renovaciones" fill="#ff8c00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Estado de suscripciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#2d2d2d', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;