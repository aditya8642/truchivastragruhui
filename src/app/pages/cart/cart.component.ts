import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  constructor(public cart: CartService, public auth: AuthService) {}

  checkout(): void {
    // TODO: once a backend /api/v1/orders (+ Razorpay) endpoint exists, call it here:
    // 1. POST the cart to create an order and get a Razorpay order id back
    // 2. Open Razorpay Checkout with that order id
    // 3. On success, POST the payment signature to a /verify endpoint, then cart.clear()
    alert('Checkout isn\'t wired up yet — the backend doesn\'t have an orders/payment endpoint. Ask to have that built and this button will go live.');
  }
}
