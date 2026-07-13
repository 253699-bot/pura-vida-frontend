import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Clock,
  Leaf,
  LogOut,
  MapPin,
  Package,
  ShoppingCart,
  Utensils,
  UserCircle,
} from 'lucide-react';
import { getTodayBusinessStatus } from '../../entities/business/businessApi.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import brandLogo from '../../shared/assets/brand/pura-vida-logo.svg';
import heroFood from '../../shared/assets/hero-food.jpg';
import { AboutSection } from './components/AboutSection.jsx';
import { LocationSection } from './components/LocationSection.jsx';
import './LandingPage.css';

const QUICK_NOTICES = {
  cart: {
    title: 'Carrito próximamente',
    description: 'Esta sección se activará cuando el backend correspondiente esté disponible.',
    to: '/carrito',
  },
  notifications: {
    title: 'Notificaciones próximamente',
    description: 'Esta sección se activará cuando el backend correspondiente esté disponible.',
    to: '/notificaciones',
  },
};

function getInitials(user) {
  const source = user?.nombre || user?.correo || 'PV';
  const initials = source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return initials.toUpperCase();
}

function getStatusView({ status, hasError, isLoading }) {
  if (isLoading) {
    return { label: 'Consultando estado', tone: 'neutral' };
  }

  if (hasError) {
    return { label: 'Estado no disponible', tone: 'neutral' };
  }

  if (!status?.configured) {
    return { label: 'Estado no configurado', tone: 'neutral' };
  }

  return status.abierto
    ? { label: 'Abierto hoy', tone: 'open' }
    : { label: 'Cerrado hoy', tone: 'closed' };
}

function LandingHeader() {
  const { isAuthenticated, isEncargada, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState(null);
  const { hash } = useLocation();
  const navigate = useNavigate();
  const initials = useMemo(() => getInitials(user), [user]);
  const accountRef = useRef(null);
  const noticeRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }

      if (noticeRef.current && !noticeRef.current.contains(event.target)) {
        setActiveNotice(null);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  function handleLogout() {
    logout();
    setIsMenuOpen(false);
    setActiveNotice(null);
    navigate('/', { replace: true });
  }

  function handleNotice(type) {
    setIsMenuOpen(false);
    setActiveNotice((currentType) => (currentType === type ? null : type));
  }

  const notice = activeNotice ? QUICK_NOTICES[activeNotice] : null;

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <Link to="/" className="landing-brand" aria-label="PuraVida inicio">
          <img className="landing-brand__logo" src={brandLogo} alt="PuraVida" />
        </Link>

        <nav className="landing-nav" aria-label="Navegación principal">
          <Link
            className={`landing-nav__link ${hash ? '' : 'landing-nav__link--active'}`.trim()}
            to="/"
          >
            Inicio
          </Link>
          <Link className="landing-nav__link" to="/menu">
            Menú del día
          </Link>
          <Link
            className={`landing-nav__link ${hash === '#ubicacion' ? 'landing-nav__link--active' : ''}`.trim()}
            to="/#ubicacion"
          >
            Ubicación
          </Link>
          <Link
            className={`landing-nav__link ${hash === '#nosotros' ? 'landing-nav__link--active' : ''}`.trim()}
            to="/#nosotros"
          >
            Nosotros
          </Link>
        </nav>

        <div className="landing-user">
          {isAuthenticated ? (
            <>
              <div className="landing-quick-actions" ref={noticeRef}>
                <button
                  type="button"
                  className="landing-icon-button"
                  aria-label="Ver estado de carrito"
                  aria-expanded={activeNotice === 'cart'}
                  onClick={() => handleNotice('cart')}
                >
                  <ShoppingCart size={20} strokeWidth={2.2} />
                  <span className="landing-icon-button__badge">0</span>
                </button>
                <button
                  type="button"
                  className="landing-icon-button"
                  aria-label="Ver estado de notificaciones"
                  aria-expanded={activeNotice === 'notifications'}
                  onClick={() => handleNotice('notifications')}
                >
                  <Bell size={20} strokeWidth={2.2} />
                </button>
                {notice ? (
                  <div className="landing-quick-popover" role="status">
                    <strong>{notice.title}</strong>
                    <span>{notice.description}</span>
                    <Link to={notice.to} onClick={() => setActiveNotice(null)}>
                      Ver sección
                    </Link>
                  </div>
                ) : null}
              </div>
              {isEncargada ? (
                <Link className="landing-panel-link" to="/admin">
                  Panel
                </Link>
              ) : null}
              <div className="landing-account" ref={accountRef}>
                <button
                  type="button"
                  className="landing-account__trigger"
                  aria-label="Abrir menú de usuario"
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((current) => !current)}
                >
                  <span className="landing-account__avatar">{initials}</span>
                  <span className="landing-account__name">{user?.nombre || user?.rol}</span>
                  <ChevronDown size={18} strokeWidth={2.2} aria-hidden="true" />
                </button>
                {isMenuOpen ? (
                  <div className="landing-account__menu">
                    <div className="landing-account__identity">
                      <strong>{user?.nombre || 'Usuario PuraVida'}</strong>
                      <span>{user?.correo}</span>
                    </div>
                    <Link
                      to="/perfil"
                      className="landing-account__item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle size={18} strokeWidth={2} aria-hidden="true" />
                      <span>
                        Mi perfil
                        <small>Próximamente</small>
                      </span>
                    </Link>
                    <Link
                      to="/mis-pedidos"
                      className="landing-account__item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package size={18} strokeWidth={2} aria-hidden="true" />
                      <span>
                        Mis pedidos
                        <small>Próximamente</small>
                      </span>
                    </Link>
                    {isEncargada ? (
                      <Link
                        to="/admin"
                        className="landing-account__item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Leaf size={18} strokeWidth={2} aria-hidden="true" />
                        <span>Panel de encargada</span>
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="landing-account__item landing-account__item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} strokeWidth={2} aria-hidden="true" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="landing-auth-actions">
              <Link className="landing-button landing-button--ghost" to="/login">
                Iniciar sesión
              </Link>
              <Link className="landing-button landing-button--outline" to="/register">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function LandingPage() {
  const [status, setStatus] = useState(null);
  const [hasStatusError, setHasStatusError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { hash } = useLocation();
  const statusView = getStatusView({ status, hasError: hasStatusError, isLoading });

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return undefined;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [hash]);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const todayStatus = await getTodayBusinessStatus();

        if (isMounted) {
          setStatus(todayStatus);
          setHasStatusError(false);
        }
      } catch {
        if (isMounted) {
          setHasStatusError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="landing-page">
      <LandingHeader />
      <main>
        <section className="landing-hero" aria-label="Presentación PuraVida">
          <img className="landing-hero__image" src={heroFood} alt="Platillos servidos en una mesa" />
          <div className="landing-hero__overlay" />
          <div className="landing-hero__content">
            <span className={`landing-status landing-status--${statusView.tone}`}>
              {statusView.label}
            </span>
            <h1>Comida de casa, hecha con cariño</h1>
            <p>Sabor local y fresco todos los días en nuestra fonda.</p>
            <Link className="landing-button landing-button--primary" to="/menu">
              Ver menú de hoy
            </Link>
          </div>
        </section>

        <AboutSection />
        <LocationSection />
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <section>
            <h2>PuraVida</h2>
            <p>Sabor local y fresco.</p>
            <p>© 2024 PuraVida. Sabor local y fresco.</p>
          </section>
          <section>
            <h2>Contacto</h2>
            <p className="landing-footer__line">
              <MapPin size={18} strokeWidth={2} aria-hidden="true" />
              Av. Primera Nte. Ote. 229, Suchiapa
            </p>
            <p className="landing-footer__line">
              <Clock size={18} strokeWidth={2} aria-hidden="true" />
              Lun - Vie: 8:00 AM - 6:00 PM
            </p>
          </section>
          <section>
            <h2>Enlaces</h2>
            <Link className="landing-footer__line" to="/#ubicacion">
              <MapPin size={18} strokeWidth={2} aria-hidden="true" />
              Ubicación
            </Link>
            <Link className="landing-footer__line" to="/#ubicacion">
              <Clock size={18} strokeWidth={2} aria-hidden="true" />
              Horarios
            </Link>
            <Link className="landing-footer__line" to="/menu">
              <Utensils size={18} strokeWidth={2} aria-hidden="true" />
              Menú
            </Link>
          </section>
        </div>
      </footer>
    </div>
  );
}
