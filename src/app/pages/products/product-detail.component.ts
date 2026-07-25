import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, getProductImageUrls } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  activeImage = signal(0);

  constructor(private route: ActivatedRoute, private productService: ProductService, public cart: CartService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const existing = this.cart.items().find(line => line.product.id === id);
    if (existing) {
      this.quantity.set(existing.quantity);
    }

    this.productService.getById(id).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  images(): string[] {
    return getProductImageUrls(this.product());
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    const existing = this.cart.items().find(line => line.product.id === p.id);
    if (existing) {
      this.cart.updateQuantity(p.id, this.quantity());
    } else {
      this.cart.add(p, this.quantity());
    }
  }

  increment(): void { this.quantity.update(q => q + 1); }
  decrement(): void { this.quantity.update(q => Math.max(1, q - 1)); }
}
