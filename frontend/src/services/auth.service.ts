import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5003/api';

  constructor(
    private http: HttpClient,
    private permissionService: PermissionService
  ) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrl + '/login', credentials);
  }

  register(userData: { username: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(this.apiUrl + '/register', userData);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(this.apiUrl + '/current-user');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.permissionService.clearPermissions();
  }

  getUserPermissions(): string[] {
    return this.permissionService.getUserPermissions();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).role;
    }
    return null;
  }

  getCurrentUserId(): number | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).id;
    }
    return null;
  }
}