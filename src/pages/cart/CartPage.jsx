import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  checkoutCart,
  deleteCartItem,
  getCart,
  updateCartItemQuantity,
} from '../../entities/cart/cartApi.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import {
  CART_UPDATED_EVENT,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../../shared/constants/events.js';
import { ClientPageLayout } from '../../shared/layouts/ClientPageLayout.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { ErrorMessage } from '../../shared/ui/ErrorMessage.jsx';
import { Loading } from '../../shared/ui/Loading.jsx';
import { formatCurrency } from '../../shared/utils/currency.js';
import { formatOrderDate } from '../../shared/utils/date.js';
import { OrderStatusBadge } from '../orders/components/OrderStatusBadge.jsx';
import './CartPage.css';

function totalFromItems(items) {
  return items.reduce((total, item) => total + item.subtotal, 0);
}

function CartItemMedia({ item }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(item.imagenUrl) && !imageFailed;

  return (
    <span className={`cart-item__media ${hasImage ? 'cart-item__media--image' : ''}`.trim()} aria-hidden="true">
      {hasImage ? (
        <img src={item.imagenUrl} alt="" onError={() => setImageFailed(true)} />
      ) : (
        <Utensils size={28} strokeWidth={1.8} />
      )}
    </span>
  );
}
function CheckoutConfirmation({ order, onClose, returnFocusRef, fallbackFocusRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    panel?.querySelector('button, a')?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panel) {
        return;
      }

      const focusable = [...panel.querySelectorAll('button:not(:disabled), a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      (returnFocusRef.current || fallbackFocusRef.current)?.focus();
    };
  }, [fallbackFocusRef, onClose, returnFocusRef]);

  return (
    <div className="checkout-dialog" role="presentation">
      <section
        ref={panelRef}
        className="checkout-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-confirmation-title"
        aria-describedby="checkout-confirmation-description"
      >
        <button
          type="button"
          className="checkout-dialog__close"
          aria-label="Cerrar confirmación"
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
        <span className="checkout-dialog__icon" aria-hidden="true">
          <CheckCircle2 size={42} strokeWidth={2.2} />
        </span>
        <h2 id="checkout-confirmation-title">Pedido confirmado</h2>
        <p id="checkout-confirmation-description">
          Tu pedido fue recibido. La encargada lo revisará y recibirás una notificación con la
          respuesta.
        </p>

        <div className="checkout-dialog__summary">
          <div>
            <strong>Pedido #PV-{order.id}</strong>
            <OrderStatusBadge status={order.estado} />
          </div>
          <span>{formatOrderDate(order.fecha, order.hora)}</span>
          <ul>
            {order.items.map((item) => (
              <li key={item.id ?? item.platilloId}>
                {item.cantidad}x {item.nombre}
              </li>
            ))}
          </ul>
          <div className="checkout-dialog__total">
            <span>Total</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
        </div>

        <div className="checkout-dialog__actions">
          <Link className="button button--primary" to={`/mis-pedidos/${order.id}`}>
            Ver estado del pedido
          </Link>
          <Link className="button button--secondary" to="/menu">
            Volver al menú
          </Link>
        </div>
      </section>
    </div>
  );
}

export function CartPage() {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [operationError, setOperationError] = useState('');
  const [pendingItemId, setPendingItemId] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const checkoutButtonRef = useRef(null);
  const emptyCartActionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        const nextCart = await getCart();

        if (isMounted) {
          setCart(nextCart);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiMessage(requestError, 'No se pudo consultar tu carrito.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      isMounted = false;
    };
  }, []);

  function replaceCartItem(updatedItem) {
    setCart((current) => {
      const items = current.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      );

      return { items, total: totalFromItems(items) };
    });
  }

  async function handleQuantityChange(item, nextQuantity) {
    if (pendingItemId !== null || isCheckingOut || nextQuantity < 1) {
      return;
    }

    setPendingItemId(item.id);
    setOperationError('');

    try {
      const updatedItem = await updateCartItemQuantity(item.id, nextQuantity);
      replaceCartItem(updatedItem);
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    } catch (requestError) {
      setOperationError(
        getApiMessage(requestError, 'No se pudo actualizar la cantidad del platillo.'),
      );
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleDelete(item) {
    if (pendingItemId !== null || isCheckingOut) {
      return;
    }

    setPendingItemId(item.id);
    setOperationError('');

    try {
      await deleteCartItem(item.id);
      setCart((current) => {
        const items = current.items.filter((currentItem) => currentItem.id !== item.id);
        return { items, total: totalFromItems(items) };
      });
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    } catch (requestError) {
      setOperationError(getApiMessage(requestError, 'No se pudo eliminar el platillo.'));
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleCheckout() {
    if (isCheckingOut || !cart?.items.length) {
      return;
    }

    setIsCheckingOut(true);
    setOperationError('');

    try {
      const order = await checkoutCart();
      setConfirmedOrder(order);
      setCart({ items: [], total: 0 });
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch (requestError) {
      setOperationError(getApiMessage(requestError, 'No se pudo confirmar el pedido.'));
    } finally {
      setIsCheckingOut(false);
    }
  }

  const handleCloseConfirmation = useCallback(() => {
    setConfirmedOrder(null);
  }, []);

  return (
    <ClientPageLayout
      className="cart-page"
      title="Mi pedido"
      description="Revisa cantidades y confirma tu pedido cuando esté listo."
      backTo="/menu"
      backLabel="Seguir viendo el menú"
    >
      {isLoading ? <Loading label="Cargando carrito..." /> : null}
      <ErrorMessage title="No pudimos cargar el carrito" message={error} />
      <ErrorMessage title="No pudimos completar la operación" message={operationError} />

      {!isLoading && !error && cart && !cart.items.length ? (
        <section className="cart-empty">
          <ShoppingCart size={42} strokeWidth={1.8} aria-hidden="true" />
          <EmptyState
            title="Tu carrito está vacío"
            message="Explora el menú del día y agrega los platillos que quieras pedir."
          />
          <Link ref={emptyCartActionRef} className="button button--primary" to="/menu">
            Ver menú del día
          </Link>
        </section>
      ) : null}

      {!isLoading && !error && cart?.items.length ? (
        <div className="cart-content">
          <section className="cart-list" aria-label="Platillos en el carrito">
            {cart.items.map((item) => {
              const isPending = pendingItemId === item.id;
              const controlsDisabled = pendingItemId !== null || isCheckingOut;

              return (
                <article className="cart-item" key={item.id}>
                  <CartItemMedia item={item} />
                  <div className="cart-item__info">
                    <h2>{item.nombre}</h2>
                    <span>{formatCurrency(item.precioUnitario)} por unidad</span>
                    <div className="cart-item__quantity" aria-label={`Cantidad de ${item.nombre}`}>
                      <button
                        type="button"
                        aria-label={`Disminuir cantidad de ${item.nombre}`}
                        disabled={controlsDisabled || item.cantidad <= 1}
                        onClick={() => handleQuantityChange(item, item.cantidad - 1)}
                      >
                        <Minus size={17} aria-hidden="true" />
                      </button>
                      <output aria-live="polite">{item.cantidad}</output>
                      <button
                        type="button"
                        aria-label={`Aumentar cantidad de ${item.nombre}`}
                        disabled={controlsDisabled}
                        onClick={() => handleQuantityChange(item, item.cantidad + 1)}
                      >
                        <Plus size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item__aside">
                    <button
                      type="button"
                      className="cart-item__delete"
                      aria-label={`Eliminar ${item.nombre} del carrito`}
                      disabled={controlsDisabled}
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={19} aria-hidden="true" />
                    </button>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                    {isPending ? <small role="status">Actualizando...</small> : null}
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <h2>Resumen</h2>
            <div>
              <span>Subtotal</span>
              <span>{formatCurrency(cart.total)}</span>
            </div>
            <div className="cart-summary__total">
              <strong>Total</strong>
              <strong>{formatCurrency(cart.total)}</strong>
            </div>
            <p>
              El pago se realiza directamente en la fonda al recibir tu pedido.
            </p>
            <button
              type="button"
              ref={checkoutButtonRef}
              className="button button--primary cart-summary__checkout"
              disabled={isCheckingOut || pendingItemId !== null}
              onClick={handleCheckout}
            >
              {isCheckingOut ? 'Confirmando...' : 'Confirmar pedido'}
              <Send size={18} aria-hidden="true" />
            </button>
            <Link className="button button--secondary" to="/menu">
              Seguir viendo el menú
            </Link>
          </aside>
        </div>
      ) : null}

      {confirmedOrder ? (
        <CheckoutConfirmation
          order={confirmedOrder}
          onClose={handleCloseConfirmation}
          returnFocusRef={checkoutButtonRef}
          fallbackFocusRef={emptyCartActionRef}
        />
      ) : null}
    </ClientPageLayout>
  );
}
