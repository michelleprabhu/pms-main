/**
 * Role Service - Frontend role management
 * Can be extended to load roles from API for full dynamic loading
 */
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // Role name to dashboard route mapping
  // This could be loaded from API/config for full dynamic loading
  private roleRoutes: { [key: string]: string } = {
    'HR Admin': '/hr-dashboard',
    'Manager': '/manager-dashboard',
    'Employee': '/employee-dashboard',
    'User Admin': '',  // No frontend yet
    'External User': ''  // No frontend yet
  };

  /**
   * Get dashboard route for a role name
   * @param roleName - Role name from API (e.g., "HR Admin")
   * @returns Dashboard route or null if no route exists
   */
  getDashboardRoute(roleName: string): string | null {
    return this.roleRoutes[roleName] || null;
  }

  /**
   * Check if role has a frontend
   * @param roleName - Role name from API
   * @returns true if role has a dashboard route
   */
  hasFrontend(roleName: string): boolean {
    const route = this.getDashboardRoute(roleName);
    return route !== null && route !== '';
  }

  /**
   * Get all role routes (for debugging)
   */
  getAllRoutes(): { [key: string]: string } {
    return { ...this.roleRoutes };
  }

  /**
   * Load routes from API (for future full dynamic loading)
   * Example:
   * this.http.get('/api/roles/routes').subscribe(routes => {
   *   this.roleRoutes = routes;
   * });
   */
  loadRoutesFromAPI(): void {
    // Future: Load from API endpoint
    // For now, routes are hardcoded but could be made dynamic
  }
}

