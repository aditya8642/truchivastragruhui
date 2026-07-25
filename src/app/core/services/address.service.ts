import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Address } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly base = `${environment.apiBaseUrl}/address`;

  constructor(private auth: AuthService, private http: HttpClient) {}

  getAll(): Observable<Address[]> {
    if (!this.auth.isLoggedIn()) {
      return of(this.getLocalAll());
    }

    return this.http.get<Address[]>(this.base).pipe(
      catchError(() => of(this.getLocalAll()))
    );
  }

  add(address: Omit<Address, 'id'>): Observable<Address> {
    const localAddress = this.createLocalAddress(address);

    if (!this.auth.isLoggedIn()) {
      return of(localAddress);
    }

    const payload = {
      ...address,
      email: this.auth.currentUser()?.email ?? ''
    };

    return this.http.post<Address>(this.base, payload).pipe(
      tap(saved => this.saveLocalAddress(saved)),
      catchError(() => of(this.saveLocalAddress(localAddress)))
    );
  }

  remove(id: string): void {
    this.persistLocal(this.getLocalAll().filter(a => a.id !== id));
  }

  private createLocalAddress(address: Omit<Address, 'id'>): Address {
    const list = this.getLocalAll();
    const newAddress: Address = { ...address, id: this.generateId() };

    if (newAddress.isDefault) {
      list.forEach(a => a.isDefault = false);
    }

    return newAddress;
  }

  private saveLocalAddress(address: Address): Address {
    const list = this.getLocalAll();
    if (address.isDefault) {
      list.forEach(a => a.isDefault = false);
    }
    list.push(address);
    this.persistLocal(list);
    return address;
  }

  private getLocalAll(): Address[] {
    const raw = localStorage.getItem(this.key());
    return raw ? JSON.parse(raw) : [];
  }

  private generateId(): string {
    return `addr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  private key(): string {
    const email = this.auth.currentUser()?.email ?? 'guest';
    return `vastragruh_addresses_${email}`;
  }

  private persistLocal(list: Address[]): void {
    localStorage.setItem(this.key(), JSON.stringify(list));
  }
}
