import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { LogoutConfirmationDialog } from '../../features/auth/logout/LogoutConfirmationDialog.jsx';
import { getCart } from '../../entities/cart/cartApi.js';
import { getMyNotifications } from '../../entities/notifications/notificationApi.js';
import {
  CART_UPDATED_EVENT,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../../shared/constants/events.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import heroFood from '../../shared/assets/hero-food.jpg';
import { useBusinessConfiguration } from '../../shared/hooks/useBusinessConfiguration.js';
import { BrandLogo } from '../../shared/ui/BrandLogo.jsx';
import { AboutSection } from './components/AboutSection.jsx';
import { LocationSection } from './components/LocationSection.jsx';
import './LandingPage.css';

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

export function LandingHeader() {
  const { isAuthenticated, isEncargada, logout, user } = useAuth();
  const { configuration } = useBusinessConfiguration();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [cartCount, setCartCount] = useState(null);
  const [unreadCount, setUnreadCount] = useState(null);
  const { hash, pathname } = useLocation();
  const navigate = useNavigate();
  const initials = useMemo(() => getInitials(user), [user]);
  const businessName = configuration?.nombreFonda || 'PuraVida';
  const accountRef = useRef(null);
  const cartRequestRef = useRef(0);
  const notificationsRequestRef = useRef(0);
  const isAccountSectionActive =
    pathname === '/perfil' || pathname.startsWith('/mis-pedidos');

  const loadCartCount = useCallback(async () => {
    const requestId = ++cartRequestRef.current;

    if (!isAuthenticated || isEncargada || pathname === '/carrito') {
      setCartCount(null);
      return;
    }

    try {
      const cart = await getCart();

      if (requestId !== cartRequestRef.current) {
        return;
      }

      setCartCount(
        cart.items.reduce((total, item) => total + item.cantidad, 0),
      );
    } catch {
      if (requestId === cartRequestRef.current) {
        setCartCount(null);
      }
    }
  }, [isAuthenticated, isEncargada, pathname]);

  const loadUnreadCount = useCallback(async () => {
    const requestId = ++notificationsRequestRef.current;

    if (!isAuthenticated || isEncargada || pathname === '/notificaciones') {
      setUnreadCount(null);
      return;
    }

    try {
      const notifications = await getMyNotifications();

      if (requestId !== notificationsRequestRef.current) {
        return;
      }

      setUnreadCount(notifications.filter((item) => !item.leido).length);
    } catch {
      if (requestId === notificationsRequestRef.current) {
        setUnreadCount(null);
      }
    }
  }, [isAuthenticated, isEncargada, pathname]);

  useEffect(() => {
    loadCartCount();
    window.addEventListener(CART_UPDATED_EVENT, loadCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, loadCartCount);
    };
  }, [loadCartCount]);

  useEffect(() => {
    loadUnreadCount();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    };
  }, [loadUnreadCount]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (
        event.key === 'Escape' &&
        accountRef.current?.querySelector('#landing-account-menu')
      ) {
        setIsMenuOpen(false);
        accountRef.current?.querySelector('.landing-account__trigger')?.focus();
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function requestLogout() {
    setIsMenuOpen(false);
    setIsConfirmingLogout(true);
  }

  function handleLogout() {
    logout();
    setIsConfirmingLogout(false);
    navigate('/', { replace: true });
  }

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <Link to="/" className="landing-brand" aria-label={`${businessName} inicio`}>
          <BrandLogo className="landing-brand__logo" />
        </Link>

        <nav className="landing-nav" aria-label="Navegación principal">
          <Link
            className={`landing-nav__link ${pathname === '/' && !hash ? 'landing-nav__link--active' : ''}`.trim()}
            to="/"
            aria-current={pathname === '/' && !hash ? 'page' : undefined}
          >
            Inicio
          </Link>
          <Link
            className={`landing-nav__link ${pathname === '/menu' ? 'landing-nav__link--active' : ''}`.trim()}
            to="/menu"
            aria-current={pathname === '/menu' ? 'page' : undefined}
          >
            Menú
          </Link>
<Link
            className={`landing-nav__link ${hash === '#nosotros' ? 'landing-nav__link--active' : ''}`.trim()}
            to="/#nosotros"
            aria-current={pathname === '/' && hash === '#nosotros' ? 'location' : undefined}
          >
            Nosotros
          </Link>

          <Link
            className={`landing-nav__link ${hash === '#ubicacion' ? 'landing-nav__link--active' : ''}`.trim()}
            to="/#ubicacion"
            aria-current={pathname === '/' && hash === '#ubicacion' ? 'location' : undefined}
          >
            Ubicación
          </Link>
        </nav>

        <div className="landing-user">
          {isAuthenticated ? (
            <>
              {!isEncargada ? (
                <div className="landing-quick-actions">
                  <Link
                    to="/carrito"
                    className={`landing-icon-button ${pathname === '/carrito' ? 'landing-icon-button--active' : ''}`.trim()}
                    aria-current={pathname === '/carrito' ? 'page' : undefined}
                    aria-label={
                      cartCount > 0
                        ? `Carrito, ${cartCount} productos`
                        : 'Abrir carrito'
                    }
                  >
                    <ShoppingCart size={20} strokeWidth={2.2} aria-hidden="true" />
                    {cartCount > 0 ? (
                      <span className="landing-icon-button__badge" aria-hidden="true">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    to="/notificaciones"
                    className={`landing-icon-button ${pathname === '/notificaciones' ? 'landing-icon-button--active' : ''}`.trim()}
                    aria-current={pathname === '/notificaciones' ? 'page' : undefined}
                    aria-label={
                      unreadCount > 0
                        ? `Notificaciones, ${unreadCount} sin leer`
                        : 'Abrir notificaciones'
                    }
                  >
                    <Bell size={20} strokeWidth={2.2} aria-hidden="true" />
                    {unreadCount > 0 ? (
                      <span className="landing-icon-button__badge" aria-hidden="true">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    ) : null}
                  </Link>
                </div>
              ) : null}
              {isEncargada ? (
                <Link className="landing-panel-link" to="/admin">
                  Panel
                </Link>
              ) : null}
              <div className="landing-account" ref={accountRef}>
                <button
                  type="button"
                  className={`landing-account__trigger ${isAccountSectionActive ? 'landing-account__trigger--active' : ''}`.trim()}
                  aria-label="Abrir menú de usuario"
                  aria-expanded={isMenuOpen}
                  aria-controls="landing-account-menu"
                  aria-current={isAccountSectionActive ? 'page' : undefined}
                  onClick={() => setIsMenuOpen((current) => !current)}
                >
                  <span className="landing-account__avatar">{initials}</span>
                  <span className="landing-account__name">{user?.nombre || user?.rol}</span>
                  <ChevronDown size={18} strokeWidth={2.2} aria-hidden="true" />
                </button>
                {isMenuOpen ? (
                  <div className="landing-account__menu" id="landing-account-menu">
                    <div className="landing-account__identity">
                      <strong>{user?.nombre || `Usuario ${businessName}`}</strong>
                      <span>{user?.correo}</span>
                    </div>
                    <Link
                      to="/perfil"
                      className={`landing-account__item ${pathname === '/perfil' ? 'landing-account__item--active' : ''}`.trim()}
                      aria-current={pathname === '/perfil' ? 'page' : undefined}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle size={18} strokeWidth={2} aria-hidden="true" />
                      <span>
                        Mi perfil
                      </span>
                    </Link>
                    {!isEncargada ? (
                      <Link
                        to="/mis-pedidos"
                        className={`landing-account__item ${pathname.startsWith('/mis-pedidos') ? 'landing-account__item--active' : ''}`.trim()}
                        aria-current={pathname.startsWith('/mis-pedidos') ? 'page' : undefined}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package size={18} strokeWidth={2} aria-hidden="true" />
                        <span>Mis pedidos</span>
                      </Link>
                    ) : null}
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
                      onClick={requestLogout}
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
      <LogoutConfirmationDialog
        open={isConfirmingLogout}
        onCancel={() => setIsConfirmingLogout(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
}

export function LandingPage() {
  const [status, setStatus] = useState(null);
  const [hasStatusError, setHasStatusError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { hash } = useLocation();
  const { configuration } = useBusinessConfiguration();
  const businessName = configuration?.nombreFonda || 'PuraVida';
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
        <section className="landing-hero" aria-label={`Presentación ${businessName}`}>
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

        <AboutSection businessName={businessName} />
        <LocationSection businessName={businessName} />
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <section>
            <h2>{businessName}</h2>
            <p>Sabor local y fresco.</p>
            <p>(c) 2026 {businessName}. Sabor local y fresco.</p>
          </section>
          <section>
            <h2>Contacto</h2>
            <p className="landing-footer__line">
              <MapPin size={18} strokeWidth={2} aria-hidden="true" />
              {configuration?.direccion || 'Av. Primera Nte. Ote. 229, Suchiapa'}
            </p>
            <p className="landing-footer__line">
              <Clock size={18} strokeWidth={2} aria-hidden="true" />
              {configuration?.horarios || 'Lun - Vie: 8:00 AM - 6:00 PM'}
            </p>
          </section>
          <section>
            <h2>Enlaces</h2>
            <Link className="landing-footer__line" to="/#ubicacion">
              <MapPin size={18} strokeWidth={2} aria-hidden="true" />
              Ubicación
            </Link>
            <Link className="landing-footer__line" to="/#horarios">
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
