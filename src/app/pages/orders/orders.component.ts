import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { StoredOrder } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders = signal<StoredOrder[]>([]);

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getAll().subscribe({
      next: (list) => this.orders.set(list),
      error: () => this.orders.set(this.orderService.getAllLocal())
    });
  }

  statusLabel(order: StoredOrder): string {
    return order.backendConfirmed ? 'Processing' : 'Pending sync';
  }
}
