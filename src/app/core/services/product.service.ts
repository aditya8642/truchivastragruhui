import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/api-response.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 12): Observable<Page<Product>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'id');
    return this.http.get<Page<Product>>(this.base, { params });
  }

  search(keyword: string, page = 0, size = 12): Observable<Page<Product>> {
    const params = new HttpParams().set('keyword', keyword).set('page', page).set('size', size);
    return this.http.get<Page<Product>>(`${this.base}/search`, { params });
  }

  getByCategory(categoryId: number, page = 0, size = 12): Observable<Page<Product>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Product>>(`${this.base}/category/${categoryId}`, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  uploadImage(productId: number, file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imageUrl: string }>(
      `${environment.apiBaseUrl}/images/upload/${productId}`, form
    );
  }
}
