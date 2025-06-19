import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    if (username && password) {
      const fakeToken = 'mock-jwt-token';
      localStorage.setItem(this.TOKEN_KEY, fakeToken);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  // ✅ Use this to check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
