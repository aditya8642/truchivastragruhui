import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthenticationResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { decodeJwtPayload } from '../utils/jwt.util';

const TOKEN_KEY = 'vastragruh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // The backend's login response is just { token } - no name/email - so the
  // "logged in as" identity comes from decoding the JWT's "sub" claim (email).
  currentUser = signal<{ email: string } | null>(this.loadUserFromStoredToken());

  constructor(private http: HttpClient) {}

  private loadUserFromStoredToken(): { email: string } | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return payload?.['sub'] ? { email: payload['sub'] } : null;
  }

  register(payload: RegisterRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${environment.apiBaseUrl}/auth/register`, payload);
  }

  login(payload: LoginRequest): Observable<ApiResponse<AuthenticationResponse>> {
    return this.http.post<ApiResponse<AuthenticationResponse>>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(tap(res => {
        const token = res.data.token;
        localStorage.setItem(TOKEN_KEY, token);
        const claims = decodeJwtPayload(token);
        this.currentUser.set(claims?.['sub'] ? { email: claims['sub'] } : null);
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
