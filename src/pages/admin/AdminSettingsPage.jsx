import { ImageUp, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getApiErrors, getApiMessage } from '../../shared/api/apiResponse.js';
import { useBusinessConfiguration } from '../../shared/hooks/useBusinessConfiguration.js';
import { BrandLogo } from '../../shared/ui/BrandLogo.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { AdminHeaderActions } from './components/AdminHeaderActions.jsx';
import { AdminWorkspaceSidebar } from './components/AdminWorkspaceSidebar.jsx';

import './AdminSettingsPage.css';
import './components/AdminPageHeader.css';

function toBusinessForm(configuration) {
  return {
    nombreFonda: configuration?.nombreFonda || 'PuraVida',
    direccion: configuration?.direccion || '',
    horarios: configuration?.horarios || '',
    telefono: configuration?.telefono || '',
    correo: configuration?.correo || '',
  };
}


export function AdminSettingsPage() {
  const {
    configuration,
    isLoading: isLoadingConfiguration,
    error: configurationError,
    updateConfiguration,
    uploadLogo,
  } = useBusinessConfiguration();
  const [businessForm, setBusinessForm] = useState(() => toBusinessForm(configuration));
  const [businessErrors, setBusinessErrors] = useState({});
  const [businessError, setBusinessError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [message, setMessage] = useState('');
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    setBusinessForm(toBusinessForm(configuration));
  }, [configuration]);


  function updateBusinessField(field, value) {
    setBusinessForm((current) => ({ ...current, [field]: value }));
    setBusinessErrors((current) => ({ ...current, [field]: '' }));
    setBusinessError('');
    setMessage('');
  }


  async function handleBusinessSubmit(event) {
    event.preventDefault();
    setIsSavingBusiness(true);
    setBusinessError('');
    setMessage('');

    try {
      await updateConfiguration({
        nombreFonda: businessForm.nombreFonda.trim(),
        direccion: businessForm.direccion.trim(),
        horarios: businessForm.horarios.trim(),
        telefono: businessForm.telefono.trim(),
        correo: businessForm.correo.trim(),
      });
      setMessage('Configuración del negocio actualizada.');
    } catch (requestError) {
      setBusinessErrors(getApiErrors(requestError));
      setBusinessError(getApiMessage(requestError, 'No se pudo guardar la configuración.'));
    } finally {
      setIsSavingBusiness(false);
    }
  }


  async function handleLogoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoError('');
    setMessage('');

    try {
      await uploadLogo(file);
      setMessage('Logo actualizado.');
    } catch (requestError) {
      setLogoError(getApiMessage(requestError, 'No se pudo subir el logo.'));
    } finally {
      setIsUploadingLogo(false);
    }
  }

  return (
    <div className="admin-settings-layout">
      <AdminWorkspaceSidebar activePath="/admin/settings" />

      <main className="admin-settings-page">
        <header className="admin-settings-header">
          <div>
            <p>Configuración</p>
            <h1 className="admin-page-header__title">Configuración del negocio</h1>
            <span>Actualiza la información pública y los datos del negocio.</span>
          </div>
          <AdminHeaderActions />
        </header>

        <div className="admin-settings-content">
          {message ? <div className="message message--success" role="status">{message}</div> : null}
          <ErrorMessage message={configurationError} />

          <section className="admin-settings-card admin-settings-card--logo">
            <h2>Logo público</h2>
            <div className="admin-settings-logo-body">
              <div className="admin-settings-logo-box">
                <BrandLogo />
              </div>
              <div className="admin-settings-logo-actions">
                <p>PNG o JPG de hasta 2 MiB. El backend valida tipo real y guarda una clave segura.</p>
                <label className="button button--secondary admin-settings-upload">
                  <ImageUp size={18} aria-hidden="true" />
                  {isUploadingLogo ? 'Subiendo...' : 'Subir logo'}
                  <input type="file" accept="image/png,image/jpeg" onChange={handleLogoChange} disabled={isUploadingLogo} />
                </label>
                <ErrorMessage message={logoError} />
              </div>
            </div>
          </section>

          <form className="admin-settings-card" onSubmit={handleBusinessSubmit}>
            <div className="admin-settings-card__heading">
              <h2>Información del negocio</h2>
              {isLoadingConfiguration ? <Loading label="Cargando negocio..." /> : null}
            </div>
            <div className="admin-settings-grid">
              <Input label="Nombre" value={businessForm.nombreFonda} error={businessErrors.nombreFonda} onChange={(event) => updateBusinessField('nombreFonda', event.target.value)} />
              <Input label="Teléfono" value={businessForm.telefono} error={businessErrors.telefono} onChange={(event) => updateBusinessField('telefono', event.target.value)} />
              <Input label="Correo" type="email" value={businessForm.correo} error={businessErrors.correo} onChange={(event) => updateBusinessField('correo', event.target.value)} />
              <Input label="Horarios" value={businessForm.horarios} error={businessErrors.horarios} onChange={(event) => updateBusinessField('horarios', event.target.value)} />
              <label className="field admin-settings-field-wide" htmlFor="business-address">
                <span className="field__label">Dirección</span>
                <textarea id="business-address" className="textarea" value={businessForm.direccion} onChange={(event) => updateBusinessField('direccion', event.target.value)} />
                {businessErrors.direccion ? <span className="field__error">{businessErrors.direccion}</span> : null}
              </label>
            </div>
            <ErrorMessage message={businessError} />
            <Button type="submit" disabled={isSavingBusiness || isLoadingConfiguration}>
              <Save size={18} aria-hidden="true" />
              {isSavingBusiness ? 'Guardando...' : 'Guardar negocio'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}


