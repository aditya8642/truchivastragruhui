import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { Product, getProductImageUrls } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { Page } from '../../core/models/api-response.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  page = signal<Page<Product> | null>(null);
  categories = signal<Category[]>([]);
  selectedCategoryId: number | null = null;
  searchTerm = '';
  currentPage = 0;
  loading = signal(true);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    public cart: CartService
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: cats => this.categories.set(cats) });

    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['category'] ? Number(params['category']) : null;
      this.currentPage = 0;
      this.fetch();
    });
  }

  fetch(): void {
    this.loading.set(true);
    const onDone = (p: Page<Product>) => { this.page.set(p); this.loading.set(false); };
    const onErr = () => { this.page.set(null); this.loading.set(false); };

    if (this.searchTerm.trim()) {
      this.productService.search(this.searchTerm.trim(), this.currentPage).subscribe({ next: onDone, error: onErr });
    } else if (this.selectedCategoryId) {
      this.productService.getByCategory(this.selectedCategoryId, this.currentPage).subscribe({ next: onDone, error: onErr });
    } else {
      this.productService.getAll(this.currentPage).subscribe({ next: onDone, error: onErr });
    }
  }

  onSearch(): void {
    this.selectedCategoryId = null;
    this.currentPage = 0;
    this.fetch();
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = id;
    this.searchTerm = '';
    this.currentPage = 0;
    this.fetch();
  }

  goToPage(n: number): void {
    this.currentPage = n;
    this.fetch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  primaryImage(product: Product): string {
    const urls = getProductImageUrls(product);
    return urls[0];
  }
}
