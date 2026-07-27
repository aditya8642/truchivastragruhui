import { Component, ElementRef, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  categories = signal<Category[]>([]);
  dropdownOpen = signal(false);

  constructor(
    public auth: AuthService,
    public cart: CartService,
    private categoryService: CategoryService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories.set(categories.filter(category => category.active)),
      error: () => this.categories.set([])
    });
  }

  logout(): void {
    this.auth.logout();
    this.cart.clear();
    this.router.navigate(['/login']);
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  // Click-outside-to-close: far more reliable than mouseleave, and works
  // the same way on touch devices where "hover" doesn't really exist.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDropdown();
  }
}
