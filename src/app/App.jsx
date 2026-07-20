import { useLocation } from 'react-router-dom';
import { LandingHeader } from '../pages/landing/LandingPage.jsx';
import { AppRouter } from './router.jsx';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
<<<<<<< Updated upstream
  const hasStandaloneAdminHeader = ['/admin/gestion-dia', '/admin/pedidos'].includes(
    location.pathname,
  );
=======
>>>>>>> Stashed changes

  return (
    <div className="app-shell">
      {!isAdminRoute && location.pathname !== '/' ? <LandingHeader /> : null}
      <AppRouter />
    </div>
  );
}
