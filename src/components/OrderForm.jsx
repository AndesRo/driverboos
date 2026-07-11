import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const OrderForm = ({ onOrderAdded }) => {
  const { user } = useAuth();
  const [comunas, setComunas] = useState([]);
  const [form, setForm] = useState({
    order_number: '',
    comuna: '',
    ruta: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'entregado'
  });
  const [monto, setMonto] = useState(0);

  // Cargar tarifas
  useEffect(() => {
    const fetchTarifas = async () => {
      const { data, error } = await supabase.from('tarifas').select('*');
      if (!error) setComunas(data);
    };
    fetchTarifas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'comuna') {
      const selected = comunas.find(c => c.comuna === value);
      setMonto(selected ? selected.monto_bruto : 0);
      // Si la comuna es Las Condes, dejar ruta vacía para que el usuario elija
      if (value === 'LAS CONDES') {
        setForm(prev => ({ ...prev, ruta: '' }));
      } else {
        setForm(prev => ({ ...prev, ruta: 'Sin ruta' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Debes iniciar sesión');
    // Validar que si es Las Condes, se seleccione una ruta
    if (form.comuna === 'LAS CONDES' && !form.ruta) {
      return alert('Para Las Condes debes seleccionar una ruta (1, 2, 3 o K)');
    }
    const { error } = await supabase.from('orders').insert({
      ...form,
      monto_bruto: monto,
      user_id: user.id
    });
    if (!error) {
      alert('Orden registrada ✅');
      setForm({
        order_number: '',
        comuna: '',
        ruta: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'entregado'
      });
      setMonto(0);
      if (onOrderAdded) onOrderAdded();
    } else {
      alert('Error: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-primary">Nueva orden</h2>
      <input
        type="text"
        name="order_number"
        placeholder="N° orden"
        required
        value={form.order_number}
        onChange={handleChange}
        className="w-full"
      />
      <select
        name="comuna"
        required
        value={form.comuna}
        onChange={handleChange}
        className="w-full"
      >
        <option value="">Seleccionar comuna</option>
        {comunas.map(c => (
          <option key={c.comuna} value={c.comuna}>
            {c.comuna} - ${c.monto_bruto}
          </option>
        ))}
      </select>

      {/* Campo ruta condicional */}
      {form.comuna === 'LAS CONDES' ? (
        <select
          name="ruta"
          required
          value={form.ruta}
          onChange={handleChange}
          className="w-full"
        >
          <option value="">Seleccionar ruta</option>
          <option value="1">Ruta 1</option>
          <option value="2">Ruta 2</option>
          <option value="3">Ruta 3</option>
          <option value="K">Ruta K (Kennedy)</option>
        </select>
      ) : (
        <input
          type="text"
          name="ruta"
          placeholder="Sin ruta (opcional)"
          value={form.ruta}
          onChange={handleChange}
          className="w-full"
          disabled={form.comuna !== ''} // si no es Las Condes, se auto-completa
        />
      )}

      <input
        type="date"
        name="fecha"
        required
        value={form.fecha}
        onChange={handleChange}
        className="w-full"
      />

      <select
        name="estado"
        value={form.estado}
        onChange={handleChange}
        className="w-full"
      >
        <option value="entregado">Entregado</option>
        <option value="parcial">Entrega parcial</option>
        <option value="no_entregado">No entregado</option>
      </select>

      <div className="text-right font-semibold">Monto bruto: ${monto}</div>
      <button type="submit" className="btn-primary w-full">Guardar</button>
    </form>
  );
};

export default OrderForm;