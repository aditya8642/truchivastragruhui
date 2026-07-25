import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { PlaceOrderPayload, PlaceOrderResponse, StoredOrder } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  // NOTE: /api/v1/orders doesn't exist on the backend yet, so this call will
  // fail (404/network error) until it's built - the checkout component
  // catches that and completes the order locally so the flow stays fully
  // testable in the meantime. Once the real endpoint exists, this starts
  // working automatically; just double-check PlaceOrderResponse matches
  // whatever fields the real endpoint actually returns.
  placeOrder(payload: PlaceOrderPayload): Observable<PlaceOrderResponse> {
    return this.http.post<PlaceOrderResponse>(`${environment.apiBaseUrl}/orders`, payload);
  }

  private key(): string {
    const email = this.auth.currentUser()?.email ?? 'guest';
    return `vastragruh_orders_${email}`;
  }

  saveOrderLocally(orderId: number | string, payload: PlaceOrderPayload, backendConfirmed: boolean): void {
    const list = this.getAllLocal();
    const stored: StoredOrder = {
      ...payload,
      orderId,
      placedAt: new Date().toISOString(),
      backendConfirmed
    };
    list.unshift(stored);
    localStorage.setItem(this.key(), JSON.stringify(list));
  }

  getAllLocal(): StoredOrder[] {
    const raw = localStorage.getItem(this.key());
    return raw ? JSON.parse(raw) : [];
  }

  getByIdLocal(orderId: string): StoredOrder | null {
    return this.getAllLocal().find(o => String(o.orderId) === String(orderId)) ?? null;
  }
}
