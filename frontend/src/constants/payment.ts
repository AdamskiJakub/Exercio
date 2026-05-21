import { type ComponentType } from 'react';
import { Banknote, CreditCard, Smartphone, Building2 } from 'lucide-react';

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BLIK: 'blik',
  TRANSFER: 'transfer',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHODS.CASH, labelKey: 'cash' },
  { value: PAYMENT_METHODS.CARD, labelKey: 'card' },
  { value: PAYMENT_METHODS.BLIK, labelKey: 'blik' },
  { value: PAYMENT_METHODS.TRANSFER, labelKey: 'transfer' },
] as const;

// Centralized icon mapping for payment methods
export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, ComponentType<{ className?: string }>> = {
  [PAYMENT_METHODS.CASH]: Banknote,
  [PAYMENT_METHODS.CARD]: CreditCard,
  [PAYMENT_METHODS.BLIK]: Smartphone,
  [PAYMENT_METHODS.TRANSFER]: Building2,
};
