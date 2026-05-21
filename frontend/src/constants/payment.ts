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
