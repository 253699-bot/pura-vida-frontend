import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LogOut,
  Pencil,
  Save,
  X,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../entities/orders/orderApi.js';
import { LogoutConfirmationDialog } from '../../features/auth/logout/LogoutConfirmationDialog.jsx';
import { getMyProfile, updateMyProfile } from '../../entities/usuario/userApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { ClientPageLayout } from '../../shared/layouts/ClientPageLayout.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import './ProfilePage.css';

const EMPTY_ORDER_STATS = {
  total: 0,
  accepted: 0,
  pending: 0,
  rejected: 0,
  cancelled: 0,
};

function getInitials(name) {
  return String(name || 'PV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function calculateOrderStats(orders) {
  return orders.reduce((stats, order) => {
    const estado = order.estado;
    return {
      ...stats,
      total: stats.total + 1,
      accepted: stats.accepted + (estado === 'aceptado' ? 1 : 0),
      pending: stats.pending + (estado === 'pendiente' ? 1 : 0),
      rejected: stats.rejected + (estado === 'rechazado' ? 1 : 0),
      cancelled: stats.cancelled + (estado === 'cancelado' ? 1 : 0),
    };
  }, EMPTY_ORDER_STATS);
}

function OrderStatCard({ icon: Icon, label, value }) {
  return (
    <div>
      <dt>
        <Icon size={20} aria-hidden="true" /> {label}
      </dt>
      <dd>{value.toLocaleString('es-MX')}</dd>
    </div>
  );
}

export function ProfilePage() {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '' });
  const [orderStats, setOrderStats] = useState(EMPTY_ORDER_STATS);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [error, setError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const initials = useMemo(() => getInitials(profile?.nombre), [profile?.nombre]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      const [profileResult, ordersResult] = await Promise.allSettled([
        getMyProfile(),
        getMyOrders(),
      ]);

      if (!isMounted) return;

      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value;
        setProfile(data);
        setForm({ nombre: data.nombre, correo: data.correo || '', telefono: data.telefono || '' });
        updateUser(data);
        setError('');
      } else {
        setError(getApiMessage(profileResult.reason, 'No se pudo consultar tu perfil.'));
      }

      if (ordersResult.status === 'fulfilled') {
        setOrderStats(calculateOrderStats(ordersResult.value));
        setOrdersError('');
      } else {
        setOrdersError(getApiMessage(ordersResult.reason, 'No se pudieron consultar tus pedidos.'));
      }

      setIsLoading(false);
      setIsLoadingOrders(false);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [updateUser]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setSaveError('');
    setSuccessMessage('');
  }

  function cancelEditing() {
    setForm({ nombre: profile.nombre, correo: profile.correo || '', telefono: profile.telefono || '' });
    setFieldErrors({});
    setSaveError('');
    setSuccessMessage('');
    setIsEditing(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const nombre = form.nombre.trim();
    const correo = form.correo.trim();
    const telefono = form.telefono.trim();
    const nextErrors = {};

    if (!nombre) {
      nextErrors.nombre = 'El nombre es obligatorio.';
    } else if (nombre.length > 150) {
      nextErrors.nombre = 'El nombre no debe exceder 150 caracteres.';
    }

    if (telefono.length > 20) {
      nextErrors.telefono = 'El teléfono no debe exceder 20 caracteres.';
    }

    if (!correo) {
      nextErrors.correo = 'El correo es obligatorio.';
    } else if (!/^\S+@\S+\.\S+$/.test(correo)) {
      nextErrors.correo = 'Ingresa un correo válido.';
    }

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    const payload = {};

    if (nombre !== profile.nombre) {
      payload.nombre = nombre;
    }

    if (correo !== profile.correo) {
      payload.correo = correo;
    }

    if (telefono !== (profile.telefono || '')) {
      payload.telefono = telefono;
    }

    if (!Object.keys(payload).length) {
      setSuccessMessage('No había cambios por guardar.');
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSuccessMessage('');

    try {
      const updatedProfile = await updateMyProfile(payload);
      setProfile(updatedProfile);
      setForm({ nombre: updatedProfile.nombre, correo: updatedProfile.correo || '', telefono: updatedProfile.telefono || '' });
      updateUser(updatedProfile);
      setSuccessMessage('Tu información se actualizó correctamente.');
      setIsEditing(false);
    } catch (requestError) {
      setSaveError(getApiMessage(requestError, 'No se pudo actualizar tu perfil.'));
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    logout();
    setIsConfirmingLogout(false);
    navigate('/', { replace: true });
  }

  return (
    <ClientPageLayout
      className="profile-page"
      title="Mi perfil"
      description="Consulta y administra la información disponible de tu cuenta."
      backLabel="Volver al inicio"
    >
      {isLoading ? <Loading label="Cargando perfil..." /> : null}
      <ErrorMessage title="No pudimos cargar tu perfil" message={error} />

      {!isLoading && !error && profile ? (
        <div className="profile-content">
          <section className="profile-summary">
            <div className="profile-avatar" aria-hidden="true">
              <span>{initials}</span>
              {profile.iconoPerfil ? (
                <img
                  src={profile.iconoPerfil}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              ) : null}
            </div>
            <div className="profile-summary__identity">
              <div>
                <h2>{profile.nombre}</h2>
                <span
                  className={`profile-status ${profile.activo ? '' : 'profile-status--inactive'}`.trim()}
                >
                  {profile.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </span>
              </div>
              <span>{profile.correo}</span>
              <span>{profile.telefono || 'Teléfono no registrado'}</span>
            </div>
            {!isEditing ? (
              <button
                type="button"
                className="button button--primary profile-summary__edit"
                onClick={() => {
                  setIsEditing(true);
                  setSuccessMessage('');
                }}
              >
                <Pencil size={18} aria-hidden="true" />
                Editar información
              </button>
            ) : null}
          </section>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-section__heading">
              <h2>Datos personales</h2>
              {isEditing ? <span>Puedes actualizar nombre, correo y teléfono.</span> : null}
            </div>
            <div className="profile-form__grid">
              <Input
                label="Nombre completo"
                name="nombre"
                value={form.nombre}
                error={fieldErrors.nombre}
                maxLength={150}
                readOnly={!isEditing}
                onChange={handleChange}
              />
              <Input
                label="Número de teléfono"
                name="telefono"
                type="tel"
                value={form.telefono}
                error={fieldErrors.telefono}
                maxLength={20}
                readOnly={!isEditing}
                onChange={handleChange}
              />
              <Input
                label="Correo electrónico"
                name="correo"
                type="email"
                value={isEditing ? form.correo : profile.correo}
                error={fieldErrors.correo}
                readOnly={!isEditing}
                onChange={handleChange}
              />
            </div>

            <ErrorMessage title="No pudimos guardar los cambios" message={saveError} />
            {successMessage ? (
              <div className="message message--success" role="status">
                {successMessage}
              </div>
            ) : null}

            {isEditing ? (
              <div className="profile-form__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={isSaving}
                  onClick={cancelEditing}
                >
                  <X size={18} aria-hidden="true" />
                  Cancelar
                </button>
                <button type="submit" className="button button--primary" disabled={isSaving}>
                  <Save size={18} aria-hidden="true" />
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            ) : null}
          </form>

          <section className="profile-details">
            <div className="profile-section__heading">
              <h2>Datos de pedidos</h2>
              <span>El total incluye todos tus pedidos realizados, también finalizados.</span>
            </div>
            {isLoadingOrders ? <Loading label="Cargando pedidos..." /> : null}
            <ErrorMessage message={ordersError} />
            {!isLoadingOrders && !ordersError && orderStats.total === 0 ? (
              <p className="profile-orders-empty">Aún no tienes pedidos registrados.</p>
            ) : null}
            {!isLoadingOrders && !ordersError && orderStats.total > 0 ? (
              <dl>
                <OrderStatCard icon={ClipboardList} label="Total de pedidos" value={orderStats.total} />
                <OrderStatCard icon={CheckCircle2} label="Pedidos aceptados" value={orderStats.accepted} />
                <OrderStatCard icon={Clock3} label="Pedidos pendientes" value={orderStats.pending} />
                <OrderStatCard icon={XCircle} label="Pedidos rechazados" value={orderStats.rejected} />
                <OrderStatCard icon={Ban} label="Pedidos cancelados" value={orderStats.cancelled} />
              </dl>
            ) : null}
          </section>

          <button
            type="button"
            className="button button--danger profile-logout"
            onClick={() => setIsConfirmingLogout(true)}
          >
            <LogOut size={19} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      ) : null}
      <LogoutConfirmationDialog
        open={isConfirmingLogout}
        onCancel={() => setIsConfirmingLogout(false)}
        onConfirm={handleLogout}
      />
    </ClientPageLayout>
  );
}
