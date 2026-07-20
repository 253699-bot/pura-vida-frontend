import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminHomePage } from '../pages/admin/AdminHomePage.jsx';
<<<<<<< Updated upstream
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage.jsx';
import { DailyManagementPage } from '../pages/admin/DailyManagementPage.jsx';
import { AdminMenuPage } from '../pages/admin/AdminMenuPage.jsx';
import { BusinessStatusPage } from '../pages/admin/BusinessStatusPage.jsx';
=======
import { AdminManualSalesPage } from '../pages/admin/AdminManualSalesPage.jsx';
import { AdminMenuPage } from '../pages/admin/AdminMenuPage.jsx';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage.jsx';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage.jsx';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage.jsx';
import { AdminStatisticsPage } from '../pages/admin/AdminStatisticsPage.jsx';
import { AdminWeeklyReportPage } from '../pages/admin/AdminWeeklyReportPage.jsx';
>>>>>>> Stashed changes
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

function AdminRoute({ children }) {
  return <ProtectedRoute roles={[USER_ROLES.ENCARGADA]}>{children}</ProtectedRoute>;
}

function ClientRoute({ children }) {
  return <ProtectedRoute roles={[USER_ROLES.CLIENTE]}>{children}</ProtectedRoute>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/menu" element={<MenuPage />} />
<<<<<<< Updated upstream
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
=======
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/mis-pedidos" element={<ClientRoute><MyOrdersPage /></ClientRoute>} />
      <Route path="/mis-pedidos/:orderId" element={<ClientRoute><OrderDetailPage /></ClientRoute>} />
      <Route path="/carrito" element={<ClientRoute><CartPage /></ClientRoute>} />
      <Route path="/notificaciones" element={<ClientRoute><NotificationsPage /></ClientRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminHomePage /></AdminRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminStatisticsPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
      <Route path="/admin/orders/history" element={<AdminRoute><AdminOrdersPage history /></AdminRoute>} />
      <Route path="/admin/menu" element={<AdminRoute><AdminMenuPage /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminWeeklyReportPage /></AdminRoute>} />
      <Route path="/admin/manual-sales" element={<AdminRoute><AdminManualSalesPage /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

      <Route path="/admin/status" element={<Navigate to="/admin/menu" replace />} />
      <Route path="/admin/gestion-dia" element={<Navigate to="/admin/menu" replace />} />
      <Route path="/admin/statistics" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/pedidos" element={<Navigate to="/admin/orders" replace />} />
      <Route path="/admin/sales/manual" element={<Navigate to="/admin/manual-sales" replace />} />
      <Route path="/admin/reports/weekly" element={<Navigate to="/admin/reports" replace />} />

>>>>>>> Stashed changes
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}