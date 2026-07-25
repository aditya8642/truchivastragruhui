import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthenticationResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { decodeJwtPayload } from '../utils/jwt.util';

const TOKEN_KEY = 'vastragruh_token';
const USER_KEY = 'vastragruh_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // currentUser holds persisted user info (email, firstName, ...)
  currentUser = signal<{ email?: string; firstName?: string; lastName?: string } | null>(this.loadUserFromStoredToken());
  // Readable display name for templates: firstName if present, otherwise email
  displayName = computed(() => {
    const u = this.currentUser();
    return u ? (u.firstName ?? u.email ?? null) : null;
  });

  constructor(private http: HttpClient) {}

  private loadUserFromStoredToken(): { email?: string; firstName?: string; lastName?: string } | null {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* ignore */ }
    }

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
        const loggedinUser = res.data.loggedinUser;
        localStorage.setItem(TOKEN_KEY, token);

        // Prefer the explicit user payload from the backend when available
        const serverUser = (res.data as any).loggedinUser;
        if (serverUser) {
          let userObj: { email?: string; firstName?: string; lastName?: string } | null = null;
          if (typeof serverUser === 'string') {
            const name = serverUser.trim();
            const firstName = name ? (name.charAt(0).toUpperCase() + name.slice(1)) : undefined;
            userObj = { firstName };
          } else if (typeof serverUser === 'object' && serverUser !== null) {
            userObj = { email: serverUser.email, firstName: serverUser.firstName, lastName: serverUser.lastName };
          }

          if (userObj) {
            localStorage.setItem(USER_KEY, JSON.stringify(userObj));
            this.currentUser.set(userObj);
            return;
          }
        }

        // Fallback to decoding the token for identity
        const claims = decodeJwtPayload(token);
        const user = claims?.['sub'] ? { email: claims['sub'] } : null;
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
