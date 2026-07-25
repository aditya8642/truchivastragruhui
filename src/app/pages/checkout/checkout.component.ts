import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { AddressService } from '../../core/services/address.service';
import { OrderService } from '../../core/services/order.service';
import { Address } from '../../core/models/address.model';
import { PaymentMethod } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  step = signal<'address' | 'payment'>('address');
  addresses = signal<Address[]>([]);
  selectedAddressId = signal<string | null>(null);
  showAddressForm = signal(false);

  formFullName = '';
  formPhone = '';
  formLine1 = '';
  formLine2 = '';
  formCity = '';
  formState = '';
  formPincode = '';
  formType: 'Home' | 'Work' | 'Other' = 'Home';
  formError = signal('');

  paymentMethod = signal<PaymentMethod | null>(null);
  placingOrder = signal(false);
  placeOrderError = signal('');

  selectedAddress = computed(() =>
    this.addresses().find(a => a.id === this.selectedAddressId()) ?? null
  );

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.cart.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.refreshAddresses();
  }

  private refreshAddresses(): void {
    this.addressService.getAll().subscribe({
      next: (list) => {
        this.addresses.set(list);
        const defaultAddr = list.find(a => a.isDefault) ?? list[0] ?? null;
        this.selectedAddressId.set(defaultAddr?.id ?? null);
        this.showAddressForm.set(list.length === 0);
      },
      error: () => {
        this.addresses.set([]);
        this.selectedAddressId.set(null);
        this.showAddressForm.set(true);
      }
    });
  }

  selectAddress(id: string): void {
    this.selectedAddressId.set(id);
    this.formError.set('');
  }

  addNewAddress(): void {
    this.showAddressForm.set(true);
    this.formError.set('');
  }

  cancelAddressForm(): void {
    if (this.addresses().length > 0) {
      this.showAddressForm.set(false);
    }
  }

  saveAddress(): void {
    this.formError.set('');

    if (!this.formFullName || !this.formPhone || !this.formLine1 || !this.formCity || !this.formState || !this.formPincode) {
      this.formError.set('Please fill in all required fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(this.formPhone)) {
      this.formError.set('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^\d{6}$/.test(this.formPincode)) {
      this.formError.set('Enter a valid 6-digit pincode.');
      return;
    }

    this.addressService.add({
      fullName: this.formFullName,
      phone: this.formPhone,
      line1: this.formLine1,
      line2: this.formLine2 || undefined,
      city: this.formCity,
      state: this.formState,
      pincode: this.formPincode,
      type: this.formType,
      isDefault: this.addresses().length === 0
    }).subscribe({
      next: (saved) => {
        this.refreshAddresses();
        this.selectAddress(saved.id);
        this.showAddressForm.set(false);
        this.resetForm();
      },
      error: () => {
        this.formError.set('Unable to save address right now. Please try again.');
      }
    });
  }

  private resetForm(): void {
    this.formFullName = '';
    this.formPhone = '';
    this.formLine1 = '';
    this.formLine2 = '';
    this.formCity = '';
    this.formState = '';
    this.formPincode = '';
    this.formType = 'Home';
  }

  proceedToPayment(): void {
    if (!this.selectedAddress()) {
      this.formError.set('Please select or add a delivery address.');
      return;
    }
    this.step.set('payment');
  }

  backToAddress(): void {
    this.step.set('address');
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  placeOrder(): void {
    const address = this.selectedAddress();
    const method = this.paymentMethod();
    if (!address || !method) return;

    this.placingOrder.set(true);
    this.placeOrderError.set('');

    // Random 5-digit order id, used as the order reference and as a fallback
    // if the backend order endpoint isn't live yet / call fails.
    const localOrderId = Math.floor(10000 + Math.random() * 90000);

    const payload = {
      orderId: localOrderId,
      items: this.cart.items().map(line => ({
        productId: line.product.id,
        name: line.product.name,
        quantity: line.quantity,
        price: line.product.price
      })),
      address,
      paymentMethod: method,
      totalAmount: this.cart.subtotal()
    };

    this.orderService.placeOrder(payload).subscribe({
      next: (res) => this.completeOrder(res?.orderId ?? localOrderId, payload, true),
      error: () => this.completeOrder(localOrderId, payload, false)
    });
  }

  private completeOrder(orderId: number | string, payload: any, backendConfirmed: boolean): void {
    this.orderService.saveOrderLocally(orderId, payload, backendConfirmed);
    this.cart.clear();
    this.placingOrder.set(false);
    this.router.navigate(['/order-confirmation', orderId]);
  }
}
