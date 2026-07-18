import { Link } from 'react-router-dom';
import { LogoutButton } from '../../features/auth/logout/LogoutButton.jsx';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { Card } from '../../shared/ui/Card.jsx';

export function AdminHomePage() {
  const { user } = useAuth();

  return (
    <main className="page">
      <header className="page__header">
        <h1 className="page__title">Panel de encargada</h1>
        <p className="page__subtitle">Sesion activa: {user?.nombre || user?.correo}</p>
        <div className="actions">
          <LogoutButton />
        </div>
      </header>
      <div className="admin-links">
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Gestión del día</h2>
              <p className="card__meta">Controla el estado de la fonda y disponibilidad del menú.</p>
            </div>
            <Link className="button button--primary" to="/admin/gestion-dia">
              Abrir gestión del día
            </Link>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Estado de fonda</h2>
              <p className="card__meta">Abre o cierra el servicio de hoy.</p>
            </div>
            <Link className="button button--primary" to="/admin/status">
              Administrar estado
            </Link>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Menu del dia</h2>
              <p className="card__meta">Configura platillos y disponibilidad.</p>
            </div>
            <Link className="button button--primary" to="/admin/menu">
              Administrar menu
            </Link>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Estadísticas</h2>
              <p className="card__meta">Consulta pedidos, ingresos y platillos destacados por periodo.</p>
            </div>
            <Link className="button button--primary" to="/admin/statistics">
              Ver estadísticas
            </Link>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Venta manual</h2>
              <p className="card__meta">Registra ventas de mostrador que no provienen de un pedido.</p>
            </div>
            <Link className="button button--primary" to="/admin/sales/manual">
              Registrar venta
            </Link>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <div>
              <h2 className="card__title">Reporte semanal</h2>
              <p className="card__meta">Consulta el resumen de la semana y descarga el PDF oficial.</p>
            </div>
            <Link className="button button--primary" to="/admin/reports/weekly">
              Abrir reporte
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
