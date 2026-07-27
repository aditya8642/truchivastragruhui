import { Component, Input, OnChanges, OnDestroy, OnInit, AfterViewInit, SimpleChanges, signal, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Auto-rotates through a product's images every `intervalMs`, with small dot
// indicators for manual selection - used on every product card in the grid.
// Dot clicks stop/prevent event propagation because these cards sit inside a
// routerLink <a> (clicking a dot should switch images, not navigate away).
@Component({
  selector: 'app-product-image-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-image-carousel.component.html',
  styleUrl: './product-image-carousel.component.css'
})
export class ProductImageCarouselComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() alt = '';
  @Input() intervalMs = 2000;

  activeIndex = signal(0);
  private rafId: number | null = null;
  private lastTick = 0;
  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startAutoRotate();
  }

  ngAfterViewInit(): void {
    // Ensure rotation begins once inputs and view are stable.
    this.startAutoRotate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images']) {
      this.activeIndex.set(0);
      this.startAutoRotate();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  pause(): void {
    // eslint-disable-next-line no-console
    console.debug('carousel: pause');
    this.clearTimer();
  }

  resume(): void {
    // eslint-disable-next-line no-console
    console.debug('carousel: resume');
    this.startAutoRotate();
  }

  select(index: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // eslint-disable-next-line no-console
    console.debug('carousel: select', index);
    this.activeIndex.set(index);
    this.startAutoRotate();
  }

  private startAutoRotate(): void {
    this.clearTimer();
    if (this.images.length <= 1) return;

    // Use requestAnimationFrame loop outside Angular to avoid timer throttling
    // and re-enter the zone only when updating the signal.
    // eslint-disable-next-line no-console
    console.debug('carousel: auto-rotate started, intervalMs=', this.intervalMs);

    this.lastTick = performance.now();
    this.ngZone.runOutsideAngular(() => {
      const loop = (now: number) => {
        const elapsed = now - this.lastTick;
        if (elapsed >= this.intervalMs) {
          this.lastTick = now;
          this.ngZone.run(() => {
            // eslint-disable-next-line no-console
            console.debug('carousel: tick -> index', this.activeIndex());
            this.activeIndex.update(i => (i + 1) % this.images.length);
            this.cdr.detectChanges();
          });
        }
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    });
  }

  private clearTimer(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
