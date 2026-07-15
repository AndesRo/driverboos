import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <header className="bg-[#2d2d2d] border-b border-[#444] p-4">
        <h1 className="text-2xl font-bold text-primary">Panel Administrador</h1>
      </header>
      <nav className="bg-[#2d2d2d] border-b border-[#444] flex space-x-4 px-4 py-2">
        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}>Dashboard</NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'text-primary font-bold' : 'text-gray-400 hover:text-white'}>Usuarios</NavLink>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;