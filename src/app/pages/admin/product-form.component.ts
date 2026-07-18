import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

// Minimal admin page for adding a product + its image, using the
// existing unauthenticated-by-controller endpoints. Tighten backend
// authorization on POST /products and /images before going live.
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  categories = signal<Category[]>([]);
  name = '';
  description = '';
  price: number | null = null;
  stock: number | null = null;
  categoryId: number | null = null;
  selectedFile: File | null = null;

  saving = signal(false);
  message = signal('');
  errorMessage = signal('');

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: cats => this.categories.set(cats) });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (!this.name || !this.price || !this.categoryId) {
      this.errorMessage.set('Name, price, and category are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const payload = {
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock ?? 0,
      active: true,
      category: { id: this.categoryId } as any
    };

    this.productService.create(payload).subscribe({
      next: (product) => {
        if (this.selectedFile) {
          this.productService.uploadImage(product.id, this.selectedFile).subscribe({
            next: () => this.finish(),
            error: () => { this.message.set('Product saved, but the image upload failed.'); this.finish(); }
          });
        } else {
          this.finish();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Could not save the product.');
      }
    });
  }

  private finish(): void {
    this.saving.set(false);
    this.message.set('Product saved.');
    setTimeout(() => this.router.navigate(['/products']), 900);
  }
}
