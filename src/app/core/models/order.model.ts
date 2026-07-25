import { Address } from './address.model';

export type PaymentMethod = 'UPI' | 'CARD' | 'COD';

export interface OrderItemPayload {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

// What gets sent to the backend once /api/v1/orders exists.
export interface PlaceOrderPayload {
  orderId: number;
  items: OrderItemPayload[];
  address: Address;
  paymentMethod: PaymentMethod;
  totalAmount: number;
}

// Adjust this to match the real response shape once the backend order
// endpoint is built - it currently doesn't exist, so this is a best guess.
export interface PlaceOrderResponse {
  orderId: number | string;
  status?: string;
}

export interface StoredOrder extends Omit<PlaceOrderPayload, 'orderId'> {
  orderId: number | string;
  placedAt: string;
  // false when the backend call failed and this order only exists locally -
  // surfaced on the confirmation page so nothing is silently misleading.
  backendConfirmed: boolean;
  // Optional status + estimated delivery when provided by backend
  status?: string;
  estimatedDeliveryDate?: string;
}
