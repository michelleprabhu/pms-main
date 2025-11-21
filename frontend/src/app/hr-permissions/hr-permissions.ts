import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PermissionService } from '../../services/permission.service';

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
}

interface Role {
  id: number;
  role_name: string;
  description: string;
}

@Component({
  selector: 'app-hr-permissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-permissions.html',
  styleUrls: ['./hr-permissions.css']
})
export class HrPermissionsComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  public permissionService = inject(PermissionService);

  private apiUrl = 'http://localhost:5002/api';
  
  // Expose Object to template
  Object = Object;

  roles: Role[] = [];
  permissions: Permission[] = [];
  permissionsByCategory: { [key: string]: Permission[] } = {};
  
  selectedRoleId: number | null = null;
  selectedRole: Role | null = null;
  rolePermissions: Set<number> = new Set(); // Set of permission IDs assigned to selected role
  
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor() {}

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  loadRoles() {
    // For now, we'll use hardcoded roles. In future, can add GET /api/roles endpoint
    this.roles = [
      { id: 1, role_name: 'User Admin', description: 'System administrator with full access' },
      { id: 2, role_name: 'HR Admin', description: 'HR management and administration' },
      { id: 3, role_name: 'Manager', description: 'Team management and evaluations' },
      { id: 4, role_name: 'Employee', description: 'Self-service employee access' },
      { id: 5, role_name: 'External User', description: 'Limited external access' }
    ];
  }

  loadPermissions() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<{ permissions: Permission[], grouped_by_category: any }>(
      `${this.apiUrl}/permissions`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        this.permissions = response.permissions || [];
        this.groupPermissionsByCategory();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.errorMessage = 'Failed to load permissions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  groupPermissionsByCategory() {
    this.permissionsByCategory = {};
    this.permissions.forEach(perm => {
      const category = perm.category || 'other';
      if (!this.permissionsByCategory[category]) {
        this.permissionsByCategory[category] = [];
      }
      this.permissionsByCategory[category].push(perm);
    });
  }

  selectRole(roleId: number) {
    this.selectedRoleId = roleId;
    this.selectedRole = this.roles.find(r => r.id === roleId) || null;
    this.loadRolePermissions(roleId);
  }

  loadRolePermissions(roleId: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<{ permissions: Permission[], permission_codes: string[] }>(
      `${this.apiUrl}/roles/${roleId}/permissions`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        this.rolePermissions = new Set(
          (response.permissions || []).map(p => p.id)
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading role permissions:', error);
        this.errorMessage = 'Failed to load role permissions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  togglePermission(permissionId: number) {
    if (this.rolePermissions.has(permissionId)) {
      this.rolePermissions.delete(permissionId);
    } else {
      this.rolePermissions.add(permissionId);
    }
  }

  isPermissionAssigned(permissionId: number): boolean {
    return this.rolePermissions.has(permissionId);
  }

  saveRolePermissions() {
    if (!this.selectedRoleId) {
      this.errorMessage = 'Please select a role first.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const permissionIds = Array.from(this.rolePermissions);

    this.http.put(
      `${this.apiUrl}/roles/${this.selectedRoleId}/permissions`,
      { permission_ids: permissionIds },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response: any) => {
        this.successMessage = `Permissions updated successfully for ${this.selectedRole?.role_name || 'role'}.`;
        this.isSaving = false;
        
        // Reload permissions to reflect changes
        setTimeout(() => {
          this.loadRolePermissions(this.selectedRoleId!);
          // Refresh user permissions if current user's role was updated
          this.permissionService.refreshPermissions();
        }, 1000);
      },
      error: (error) => {
        console.error('Error saving role permissions:', error);
        this.errorMessage = error.error?.error || 'Failed to save permissions. Please try again.';
        this.isSaving = false;
      }
    });
  }

  navigateBack() {
    this.router.navigate(['/hr-management']);
  }

  getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'pages': 'Page Access',
      'actions': 'Actions',
      'hr_management': 'HR Management',
      'other': 'Other'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }
}

