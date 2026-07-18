import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartLine {
  product: Product;
  quantity: number;
}

const CART_KEY = 'vastragruh_cart';

// Client-side cart for now - there's no backend cart/order endpoint yet.
// Swap this to call a real /api/v1/orders endpoint once that exists on the backend.
@Injectable({ providedIn: 'root' })
export class CartService {
  private lines = signal<CartLine[]>(this.load());

  readonly items = this.lines.asReadonly();
  readonly itemCount = computed(() => this.lines().reduce((sum, l) => sum + l.quantity, 0));
  readonly subtotal = computed(() => this.lines().reduce((sum, l) => sum + l.product.price * l.quantity, 0));

  private load(): CartLine[] {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private persist(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this.lines()));
  }

  add(product: Product, quantity = 1): void {
    const existing = this.lines().find(l => l.product.id === product.id);
    if (existing) {
      this.lines.update(lines =>
        lines.map(l => l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l)
      );
    } else {
      this.lines.update(lines => [...lines, { product, quantity }]);
    }
    this.persist();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.lines.update(lines => lines.map(l => l.product.id === productId ? { ...l, quantity } : l));
    this.persist();
  }

  remove(productId: number): void {
    this.lines.update(lines => lines.filter(l => l.product.id !== productId));
    this.persist();
  }

  clear(): void {
    this.lines.set([]);
    this.persist();
  }
}
