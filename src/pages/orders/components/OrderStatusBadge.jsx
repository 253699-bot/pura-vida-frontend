import {
  Ban,
  CheckCircle2,
  CircleDot,
  CircleX,
  ClipboardCheck,
  HelpCircle,
} from 'lucide-react';
import { getOrderStatusDetails } from '../../../entities/orders/orderModel.js';
import './OrderStatusBadge.css';

const STATUS_ICONS = {
  pendiente: CircleDot,
  aceptado: CheckCircle2,
  finalizado: ClipboardCheck,
  rechazado: CircleX,
  cancelado: Ban,
};

export function OrderStatusBadge({ status }) {
  const details = getOrderStatusDetails(status);
  const Icon = STATUS_ICONS[status] || HelpCircle;

  return (
    <span className={`order-status order-status--${details.tone}`}>
      <Icon size={14} strokeWidth={2.4} aria-hidden="true" />
      {details.label}
    </span>
  );
}
