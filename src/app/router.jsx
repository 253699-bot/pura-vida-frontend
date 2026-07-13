import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminHomePage } from '../pages/admin/AdminHomePage.jsx';
import { DailyManagementPage } from '../pages/admin/DailyManagementPage.jsx';
import { AdminMenuPage } from '../pages/admin/AdminMenuPage.jsx';
import { BusinessStatusPage } from '../pages/admin/BusinessStatusPage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { CartPage } from '../pages/cart/CartPage.jsx';
import { LandingPage } from '../pages/landing/LandingPage.jsx';
import { MenuPage } from '../pages/menu/MenuPage.jsx';
import { NotificationsPage } from '../pages/notifications/NotificationsPage.jsx';
import { MyOrdersPage } from '../pages/orders/MyOrdersPage.jsx';
import { ProfilePage } from '../pages/profile/ProfilePage.jsx';
import { ProtectedRoute } from '../shared/auth/ProtectedRoute.jsx';
import { USER_ROLES } from '../shared/constants/roles.js';

export function AppRouter() {
  const encargadaOnly = [USER_ROLES.ENCARGADA];

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-pedidos"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carrito"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notificaciones"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/gestion-dia"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <DailyManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/status"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <BusinessStatusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminMenuPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
