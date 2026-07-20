import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminHomePage } from '../pages/admin/AdminHomePage.jsx';
import { AdminManualSalesPage } from '../pages/admin/AdminManualSalesPage.jsx';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage.jsx';
import { AdminStatisticsPage } from '../pages/admin/AdminStatisticsPage.jsx';
import { AdminWeeklyReportPage } from '../pages/admin/AdminWeeklyReportPage.jsx';
import { DailyManagementPage } from '../pages/admin/DailyManagementPage.jsx';
import { AdminMenuPage } from '../pages/admin/AdminMenuPage.jsx';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage.jsx';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage.jsx';
import { BusinessStatusPage } from '../pages/admin/BusinessStatusPage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { CartPage } from '../pages/cart/CartPage.jsx';
import { LandingPage } from '../pages/landing/LandingPage.jsx';
import { MenuPage } from '../pages/menu/MenuPage.jsx';
import { NotificationsPage } from '../pages/notifications/NotificationsPage.jsx';
import { MyOrdersPage } from '../pages/orders/MyOrdersPage.jsx';
import { OrderDetailPage } from '../pages/orders/OrderDetailPage.jsx';
import { ProfilePage } from '../pages/profile/ProfilePage.jsx';
import { ProtectedRoute } from '../shared/auth/ProtectedRoute.jsx';
import { USER_ROLES } from '../shared/constants/roles.js';

export function AppRouter() {
  const encargadaOnly = [USER_ROLES.ENCARGADA];
  const clienteOnly = [USER_ROLES.CLIENTE];

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
          <ProtectedRoute roles={clienteOnly}>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carrito"
        element={
          <ProtectedRoute roles={clienteOnly}>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notificaciones"
        element={
          <ProtectedRoute roles={clienteOnly}>
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
        path="/mis-pedidos/:orderId"
        element={
          <ProtectedRoute roles={clienteOnly}>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pedidos"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pedidos/history"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminOrdersPage history />
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
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminStatisticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sales/manual"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminManualSalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports/weekly"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminWeeklyReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notificaciones"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute roles={encargadaOnly}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
