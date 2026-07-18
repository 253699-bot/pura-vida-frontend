import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../../entities/usuario/userApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { ClientPageLayout } from '../../shared/layouts/ClientPageLayout.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import './ProfilePage.css';

function getInitials(name) {
  return String(name || 'PV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function roleLabel(role) {
  if (role === 'encargada') {
    return 'Encargada';
  }

  if (role === 'cliente') {
    return 'Cliente';
  }

  return 'Rol no disponible';
}

export function ProfilePage() {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ nombre: '', telefono: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const initials = useMemo(() => getInitials(profile?.nombre), [profile?.nombre]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const data = await getMyProfile();

        if (isMounted) {
          setProfile(data);
          setForm({ nombre: data.nombre, telefono: data.telefono || '' });
          updateUser(data);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiMessage(requestError, 'No se pudo consultar tu perfil.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
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
    setForm({ nombre: profile.nombre, telefono: profile.telefono || '' });
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

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    const payload = {};

    if (nombre !== profile.nombre) {
      payload.nombre = nombre;
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
      setForm({ nombre: updatedProfile.nombre, telefono: updatedProfile.telefono || '' });
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
              {isEditing ? <span>Solo puedes actualizar nombre y teléfono.</span> : null}
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
                value={profile.correo}
                readOnly
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
            <h2>Cuenta</h2>
            <dl>
              <div>
                <dt>
                  <Mail size={20} aria-hidden="true" /> Correo
                </dt>
                <dd>{profile.correo}</dd>
              </div>
              <div>
                <dt>
                  <Phone size={20} aria-hidden="true" /> Teléfono
                </dt>
                <dd>{profile.telefono || 'No registrado'}</dd>
              </div>
              <div>
                <dt>
                  <ShieldCheck size={20} aria-hidden="true" /> Rol
                </dt>
                <dd>{roleLabel(profile.rol)}</dd>
              </div>
              <div>
                <dt>
                  <Bell size={20} aria-hidden="true" /> Notificaciones de pedidos
                </dt>
                <dd>{profile.notificacionesActivas ? 'Activadas' : 'Desactivadas'}</dd>
              </div>
            </dl>
          </section>

          <button
            type="button"
            className="button button--danger profile-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </ClientPageLayout>
  );
}
