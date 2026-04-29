import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Providers from './pages/Providers';
import Deboning from './pages/Deboning';
import CashManagement from './pages/CashManagement';
import HR from './pages/HR';
import Configuration from './pages/Configuration';
import Login from './pages/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="inventario" element={<Inventory />} />
        <Route path="compras" element={<ProtectedRoute adminOnly><Purchases /></ProtectedRoute>} />
        <Route path="despresaje" element={<ProtectedRoute adminOnly><Deboning /></ProtectedRoute>} />
        <Route path="ventas" element={<Sales />} />
        <Route path="proveedores" element={<Providers />} />
        <Route path="caja" element={<CashManagement />} />
        <Route path="rrhh" element={<ProtectedRoute adminOnly><HR /></ProtectedRoute>} />
        <Route path="configuracion" element={<ProtectedRoute adminOnly><Configuration /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
