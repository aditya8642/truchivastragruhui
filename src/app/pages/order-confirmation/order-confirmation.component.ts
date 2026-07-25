import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { StoredOrder } from '../../core/models/order.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent implements OnInit {
  order = signal<StoredOrder | null>(null);

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('orderId') ?? '';
    this.orderService.getById(id).subscribe({ next: (o) => this.order.set(o), error: () => this.order.set(this.orderService.getByIdLocal(id)) });
  }

  paymentLabel(method: string): string {
    switch (method) {
      case 'UPI': return 'UPI';
      case 'CARD': return 'Credit / Debit Card';
      case 'COD': return 'Cash on Delivery';
      default: return method;
    }
  }
}
