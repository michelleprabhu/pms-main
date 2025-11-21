import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Get required permissions from route data
    const requiredPermissions = route.data['permissions'] as string[] | string;
    
    // If no permissions required, allow access
    if (!requiredPermissions) {
      return true;
    }

    // Convert to array if single string
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    // Check if user has at least one of the required permissions
    const hasPermission = this.permissionService.hasAnyPermission(permissions);

    if (!hasPermission) {
      console.warn(`Access denied: User does not have required permissions: ${permissions.join(', ')}`);
      // Redirect to login or show error (you can customize this)
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}

