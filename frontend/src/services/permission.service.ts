import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userPermissions: string[] = [];

  constructor() {
    this.loadPermissionsFromStorage();
  }

  /**
   * Load permissions from localStorage (set after login)
   */
  private loadPermissionsFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userPermissions = user.permissions || [];
        console.log(`[PermissionService] Loaded ${this.userPermissions.length} permissions from localStorage for user: ${user.email || 'unknown'}`);
      } catch (e) {
        console.error('Error loading permissions from storage:', e);
        this.userPermissions = [];
      }
    }
  }

  /**
   * Set user permissions (called after login or refresh)
   */
  setPermissions(permissions: string[]): void {
    this.userPermissions = permissions || [];
    console.log(`[PermissionService] Set ${this.userPermissions.length} permissions:`, this.userPermissions.slice(0, 5), '...');
    
    // Update localStorage user object
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.permissions = this.userPermissions;
        localStorage.setItem('user', JSON.stringify(user));
        console.log(`[PermissionService] Updated localStorage with permissions for user: ${user.email || 'unknown'}`);
      } catch (e) {
        console.error('Error updating permissions in storage:', e);
      }
    }
  }

  /**
   * Get all user permissions
   */
  getUserPermissions(): string[] {
    return [...this.userPermissions];
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permissionCode: string): boolean {
    return this.userPermissions.includes(permissionCode);
  }

  /**
   * Check if user has at least one of the specified permissions
   */
  hasAnyPermission(permissionCodes: string[]): boolean {
    if (!permissionCodes || permissionCodes.length === 0) {
      return true; // No permission required
    }
    return permissionCodes.some(code => this.userPermissions.includes(code));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissionCodes: string[]): boolean {
    if (!permissionCodes || permissionCodes.length === 0) {
      return true; // No permission required
    }
    return permissionCodes.every(code => this.userPermissions.includes(code));
  }

  /**
   * Clear permissions (on logout)
   */
  clearPermissions(): void {
    this.userPermissions = [];
  }

  /**
   * Refresh permissions from backend (call /api/current-user)
   */
  async refreshPermissions(): Promise<void> {
    try {
      const response = await fetch('http://localhost:5003/api/current-user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        const permissions = user.permissions || [];
        console.log(`[PermissionService] Refreshed ${permissions.length} permissions from backend for user: ${user.email || 'unknown'}`);
        this.setPermissions(permissions);
      } else {
        console.warn('[PermissionService] Failed to refresh permissions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    }
  }
}

