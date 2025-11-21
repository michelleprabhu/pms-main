import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoleService } from '../../../services/role.service';
import { PermissionService } from '../../../services/permission.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);

  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Store permissions in permission service
        const permissions = response.user.permissions || [];
        this.permissionService.setPermissions(permissions);
        
        // Debug logs
        console.log('Login response:', response);
        console.log('Role ID:', response.user.role_id, 'Type:', typeof response.user.role_id);
        console.log('Role name:', response.user.role);
        console.log('Permissions:', permissions);
        
        // Route based on role name (dynamic - works even if role_id changes)
        const roleName = response.user.role; // e.g., "HR Admin"
        console.log('Role name:', roleName);
        console.log('Role ID:', response.user.role_id, '(for reference only)');
        
        // Get dashboard route dynamically from role service
        const dashboardRoute = this.roleService.getDashboardRoute(roleName);
        
        if (dashboardRoute) {
          console.log(`Routing to ${roleName} dashboard: ${dashboardRoute}`);
          this.router.navigate([dashboardRoute]);
        } else {
          // No frontend for this role (User Admin, External User)
          console.log(`${roleName} - no frontend available`);
          this.errorMessage = `${roleName} frontend is not available yet`;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Invalid email or password';
      }
    });
  }
}
