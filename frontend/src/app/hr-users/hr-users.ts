import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PermissionService } from '../../services/permission.service';

interface User {
  id: number;
  username: string;
  email: string;
  role?: { role_name: string } | string;
  employee_id?: number;
  is_active: boolean;
}

@Component({
  selector: 'app-hr-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hr-users.html',
  styleUrls: ['./hr-users.css']
})
export class HrUsersComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  public permissionService = inject(PermissionService);

  isSidebarCollapsed = false;
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  showModal = false;
  isEditMode = false;
  selectedUser: User | null = null;

  userForm = {
    username: '',
    email: '',
    password: '',
    role_id: null as number | null,
    employee_id: null as number | null,
    is_active: true
  };

  roles = [
    { id: 1, name: 'User Admin' },
    { id: 2, name: 'HR Admin' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Employee' },
    { id: 5, name: 'External User' }
  ];

  constructor() {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.getAllUsers(true).subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateToDashboard() {
    this.router.navigate(['/hr-dashboard']);
  }

  navigateToPlanning() {
    this.router.navigate(['/planning']);
  }

  navigateToScoreCards() {
    this.router.navigate(['/score-cards']);
  }

  navigateToEvaluation() {
    this.router.navigate(['/evaluation-periods']);
  }

  navigateToReports() {
    this.router.navigate(['/hr-reports']);
  }

  navigateToManagement() {
    this.router.navigate(['/hr-management']);
  }

  navigateToReviewPeriod() {
    this.router.navigate(['/review-period']);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm = {
      username: '',
      email: '',
      password: '',
      role_id: null,
      employee_id: null,
      is_active: true
    };
    this.showModal = true;
  }

  openEditModal(user: User) {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm = {
      username: user.username,
      email: user.email,
      password: '', // Don't pre-fill password
      role_id: typeof user.role === 'object' ? (user.role as any).id : null,
      employee_id: user.employee_id || null,
      is_active: user.is_active
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }

  saveUser() {
    if (!this.userForm.username || !this.userForm.email) {
      this.errorMessage = 'Username and email are required';
      return;
    }

    if (!this.isEditMode && !this.userForm.password) {
      this.errorMessage = 'Password is required for new users';
      return;
    }

    if (!this.userForm.role_id) {
      this.errorMessage = 'Role is required';
      return;
    }

    const payload: any = {
      username: this.userForm.username,
      email: this.userForm.email,
      role_id: this.userForm.role_id,
      employee_id: this.userForm.employee_id,
      is_active: this.userForm.is_active
    };

    if (this.userForm.password) {
      payload.password = this.userForm.password;
    }

    if (this.isEditMode && this.selectedUser) {
      this.userService.updateUser(this.selectedUser.id, payload).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessage = error.error?.error || 'Failed to update user';
        }
      });
    } else {
      this.userService.createUser(payload).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.loadUsers();
          this.closeModal();
          this.errorMessage = ''; // Clear any previous errors
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.errorMessage = error.error?.error || 'Failed to create user. Please check the console for details.';
          // Keep modal open so user can see the error
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }
}

