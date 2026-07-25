import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  // Fetch orders from backend with local fallback
  getAll(): Observable<StoredOrder[]> {
    if (!this.auth.isLoggedIn()) {
      return of(this.getAllLocal());
    }

    return this.http.get<any[]>(`${environment.apiBaseUrl}/orders`).pipe(
      map(res => res.map(r => this.mapOrderResponse(r))),
      catchError(() => of(this.getAllLocal()))
    );
  }

  // Fetch single order from backend with local fallback
  getById(orderId: string | number): Observable<StoredOrder | null> {
    if (!this.auth.isLoggedIn()) {
      return of(this.getByIdLocal(String(orderId)));
    }

    return this.http.get<any>(`${environment.apiBaseUrl}/orders/${orderId}`).pipe(
      map(r => this.mapOrderResponse(r)),
      catchError(() => of(this.getByIdLocal(String(orderId))))
    );
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

  private mapOrderResponse(r: any): StoredOrder {
    return {
      orderId: r.orderId,
      items: (r.items || []).map((i: any) => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
      address: {
        id: r.address?.id ?? `addr_${r.orderId}`,
        fullName: r.address?.fullName ?? '',
        phone: r.address?.phone ?? '',
        line1: r.address?.line1 ?? '',
        line2: r.address?.line2 ?? undefined,
        city: r.address?.city ?? '',
        state: r.address?.state ?? '',
        pincode: r.address?.pincode ?? '',
        type: r.address?.type ?? 'Home',
        isDefault: true
      },
      paymentMethod: r.paymentMethod,
      totalAmount: r.totalAmount,
      placedAt: r.placedAt ?? new Date().toISOString(),
      backendConfirmed: true,
      status: r.status,
      estimatedDeliveryDate: r.estimatedDeliveryDate
    } as StoredOrder;
  }
}
