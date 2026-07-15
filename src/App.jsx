import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubscriptionBlocked from './pages/SubscriptionBlocked';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import Report from './components/Report';
import Extras from './components/Extras';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import SubscriptionBanner from './components/SubscriptionBanner';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/subscription-blocked" element={<SubscriptionBlocked />} />
          
          {/* Ruta de administración - FUERA del ProtectedRoute */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          
          {/* Rutas protegidas por suscripción */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="app-container">
                <SubscriptionBanner />
                <Routes>
                  <Route path="/" element={<OrderForm />} />
                  <Route path="/ordenes" element={<OrderList />} />
                  <Route path="/extras" element={<Extras />} />
                  <Route path="/reporte" element={<Report />} />
                </Routes>
                <Navbar />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
